import chalk from 'chalk';
import express from 'express';
import { IsPhoneNumber } from './Utils';
import restoreUsersFromFile from './class/restoreUser';
import user from './class/user';
import llama from './llama';
import sms from './smsSender';

function main() {
	const smsAPI = new sms();
	const llamaAPI = new llama('../llama.cpp/examples/myChat.sh')
	const app = express();
	const port = 5000;
	const prefix = '!';
	let userArray: Array<user> = restoreUsersFromFile();

	app.listen(port, () => {
		console.log('Listening on port ' + port);
	});

	app.post('/', req => {
		if (typeof req.query.message != 'string' || typeof req.query.contact != 'string') { return; };
		let phoneNumber = req.query.contact;
		let message = req.query.message;

		if (phoneNumber.startsWith('+33')) { phoneNumber = phoneNumber.replace('+33', '0') };

		if (!IsPhoneNumber(phoneNumber)) { console.log(req.query); return; };

		if (message.startsWith(prefix)) {
			message = message.replace(prefix, '');
			console.log('[' + chalk.yellow('COMMAND') + ']	\'' + chalk.bold(phoneNumber) + '\': ' + message);
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