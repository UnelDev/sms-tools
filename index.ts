import chalk from 'chalk';
import express from 'express';
import { IsPhoneNumber, removeEmoji, removeAll, toReadableDuration } from './Utils';
import user from './class/user';
import llama from './class/llama';
import sms from './class/smsSender';
import { restoreUsersFromFile, restoreadminFromFile } from './class/restore';
import admin from './class/admin';
import command from './command';

async function main() {
	console.log('starting...');
	const smsAPI = new sms();
	if (!smsAPI) {
		return;
	}
	let userArray: Array<user> = restoreUsersFromFile();
	let adminArray: Array<admin> = restoreadminFromFile();
	const llamaAPI = await new Promise<llama>(resolve => {
		const l = new llama('../llama.cpp/examples/myChat.sh', () => resolve(l));
	});
	console.log('Llama started!');
	const app = express();
	app.use(express.json());
	const port = 5000;
	const prefix = '!';
	let curentHistory: Array<[Date, string, string]> = [[new Date(0), '0000000000', 'started']];

	app.listen(port, () => {
		console.log('Listening on port ' + port);
	});

	app.post('/', async (req, res) => {
		if (typeof req.body.message != 'string' || typeof req.body.contact != 'string') {
			console.log('bad body');
			return;
		}
		let phoneNumber = req.body.contact;
		let message: string = req.body.message;
		res.status(200);

		message = removeAll(message, '\n');
		message = removeEmoji(message);
		message.trim();

		if (phoneNumber.startsWith('+33')) {
			phoneNumber = phoneNumber.replace('+33', '0');
		}

		if (!IsPhoneNumber(phoneNumber)) {
			console.log(
				'[' + chalk.red('ERROR') + "] '" + 'recevied message from: ' + chalk.bold(phoneNumber) + "': " + message
			);
		}

		if (message.startsWith(prefix)) {
			message = message.replace(prefix, '');
			console.log('[' + chalk.yellow('COMMAND') + "] '" + chalk.bold(phoneNumber) + "': " + message);
			command(message, phoneNumber, req, Date.now(), smsAPI, llamaAPI, adminArray, userArray, curentHistory);
		} else {
			ProcessMessage(phoneNumber, userArray, curentHistory, message, smsAPI, llamaAPI);
		}
	});
}

console.clear();
main();

function ProcessMessage(
	phoneNumber: any,
	userArray: user[],
	curentHistory: [Date, string, string][],
	message: string,
	smsAPI: sms,
	llamaAPI: llama
) {
	process.stdout.write('[' + chalk.blue('MESSAGE') + "] '" + chalk.bold(phoneNumber) + "': ");

	const targetUser = userArray.find(Element => Element.phoneNumber == phoneNumber);
	if (typeof targetUser == 'undefined') {
		targetUser == new user(phoneNumber);
	}

	if (
		curentHistory[curentHistory.length - 1][0].getTime() + 300000 < new Date().getTime() ||
		curentHistory[curentHistory.length - 1][1] == targetUser.phoneNumber ||
		message.includes('.bypass')
	) {
		targetUser.newMessage(message, smsAPI, llamaAPI, curentHistory);
	} else {
		targetUser.sendMessage(
			'already under discussion add .bypass for bypass, last message ' +
				(new Date().getTime() - curentHistory[curentHistory.length - 1][0].getTime()) / 1000 +
				's ago',
			smsAPI
		);
	}
}
