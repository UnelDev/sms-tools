import chalk from 'chalk';
import express from 'express';
import { IsPhoneNumber, removeEmoji, removeAll } from './Utils';
import user from './class/user';
import llama from './class/llama';
import sms from './class/smsSender';
import { restoreUsersFromFile, restoreadminFromFile } from './class/restore';
import admin from './class/admin';
import command from './command';

async function main() {
	const smsAPI = new sms();
	if (!smsAPI) { return; }
	const llamaAPI = new Promise(resolve => {
		new llama('../llama.cpp/examples/myChat.sh', resolve);
	}) as unknown as llama;
	const app = express();
	app.use(express.json());
	const port = 5000;
	const prefix = '!';
	let userArray: Array<user> = restoreUsersFromFile();
	let adminArray: Array<admin> = restoreadminFromFile();

	await llamaAPI;


	app.listen(port, () => {
		console.log('Listening on port ' + port);
	});

	app.post('/', async (req, res) => {
		if (typeof req.body.message != 'string' || typeof req.body.contact != 'string') { console.log('bad body'); return; };
		let phoneNumber = req.body.contact;
		let message: string = req.body.message;
		res.status(200);

		message = removeAll(message, '\n')
		message = removeEmoji(message);
		message.trim();

		if (phoneNumber.startsWith('+33')) { phoneNumber = phoneNumber.replace('+33', '0') };

		if (!IsPhoneNumber(phoneNumber)) {
			console.log('[' + chalk.red('ERROR') + '] \'' + 'recevied message from: ' + chalk.bold(phoneNumber) + '\': ' + message);
		};

		if (message.startsWith(prefix)) {
			message = message.replace(prefix, '');
			console.log('[' + chalk.yellow('COMMAND') + ']	\'' + chalk.bold(phoneNumber) + '\': ' + message);
			command(message, phoneNumber, req, smsAPI, llamaAPI, adminArray, userArray);
		} else {
			process.stdout.write('[' + chalk.blue('MESSAGE') + '] \'' + chalk.bold(phoneNumber) + '\': ');
			let exist: boolean[] | undefined;
			if (userArray.length != 0) {
				exist = userArray.map(element => element.newMessage(phoneNumber, message, smsAPI, llamaAPI));
			}
			if (!exist?.some(Element => Element == true)) {
				const User = new user(phoneNumber);
				User.newMessage(phoneNumber, message, smsAPI, llamaAPI);
				userArray = restoreUsersFromFile();
			}
		}
	});
}

console.clear();
main();