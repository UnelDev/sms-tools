import express from 'express';

import { IsPhoneNumber } from './Utils';
import adminAction from './admin/Commands';
import isBan from './admin/checkBan';
import models from './models';
import sms from './smsSender';
import chalk from 'chalk';

const app = express();
const port = 5000;
const prefix = '!';

app.post('/', req => {
	if (typeof req.query.message != 'string' || typeof req.query.contact != 'string') return;
	let phoneNumber = req.query.contact;
	let message = req.query.message;

	if (phoneNumber.startsWith('+33')) phoneNumber = phoneNumber.replace('+33', '0');


	if (isBan(phoneNumber)) {
		console.log('[' + chalk.yellow('BANNED USER') + ']	\'' + chalk.bold(phoneNumber) + '\': Sent a message');
		return;
	}

	if (!IsPhoneNumber(phoneNumber)) return;

	if (message.startsWith(prefix)) {
		message = message.replace(prefix, '');
		console.log('[' + chalk.yellow('COMMAND') + ']	\'' + chalk.bold(phoneNumber) + '\': ' + message);
		adminAction(phoneNumber, message, myModel, mySms);
	} else {
		process.stdout.write('[' + chalk.blue('MESSAGE') + '] \'' + chalk.bold(phoneNumber) + '\': ');
		myModel.send(message, message => {
			console.log('[' + chalk.green('MODEL') + '] ' + message);
			mySms.sendSms(phoneNumber, message);
		});
	}
});

console.clear();

const mySms = new sms();
const myModel = new models('../llama.cpp/examples/myChat.sh');

app.listen(port, () => {
	console.log('Listening on port ' + port);
});