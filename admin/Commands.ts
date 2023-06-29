
import * as dotenv from 'dotenv';
import fs from 'fs';

import models from '../models';
import sms from '../smsSender';
import { IsPhoneNumber } from '../Utils';

dotenv.config();

export default function adminAction(phoneNumber: string, message: string, model: models, sms: sms) {
	message = CleanMessage(message);
	const command = message.split(' ')[0];

	if (!process.env.ADMIN_NUMBER?.includes(phoneNumber)) {
		sms.sendSms(phoneNumber, 'Insufficient permissions');
		if (command == 'ping') {
			ping(phoneNumber, model, sms);
		}
		return;
	}

	if (command == 'restart') {
		restart(phoneNumber, model, sms);
	} else if (command == 'ban') {
		ban(phoneNumber, message, sms);
	} else if (command == 'unban') {
		unban(phoneNumber, message, sms);
	} else {
		sms.sendSms(phoneNumber, 'Unknown command \'' + command + '\'');
	}
}

function CleanMessage(message: string) {
	message = message.toLocaleLowerCase();
	while (message.startsWith(' ')) { const array = message.split(""); array.shift(); message = array.join("") };
	while (message.endsWith(' ')) { const array = message.split(""); array.pop(); message = array.join("") };

	return message;
}

function ping(phoneNumber: string, model: models, sms: sms) {
	const start = Date.now();
	new Promise(resolve => {
		model.send('What\'s your name?', resolve);
	}).then(() => {
		sms.sendSms(phoneNumber, 'The model respond in ' + ((Date.now() - start) / 1000).toFixed(1) + 's');
	});
}

function restart(phoneNumber: string, model: models, sms: sms) {
	sms.sendSms(phoneNumber, 'Restarting system...');
	model.restart();
}
function ban(phoneNumber: string, message: string, sms: sms) {
	let forceAction = false;
	if (message.includes('force')) {
		forceAction = true;
		message = message.replace('force', '');
		message = CleanMessage(message);
		console.log(message);
	}
	const messageArray = message.split(' ');
	if (messageArray.length != 2 && messageArray.length != 3) {
		sms.sendSms(phoneNumber, 'Syntax: ban <number> [duration]');
		return;
	}
	if (!IsPhoneNumber(messageArray[1])) {
		sms.sendSms(phoneNumber, 'Syntax: ban <number> [duration]');
		return;
	}
	if (messageArray.length == 3) {
		if (isNaN(parseInt(messageArray[2]))) {
			sms.sendSms(phoneNumber, 'Syntax: ban <number> [duration]');
			return;
		}
	}

	if (!forceAction) {
		const conv: Array<[string, string, string]> = JSON.parse(fs.readFileSync('./datas/convSave.json')?.toString() ?? '[]');
		console.log({ conv, messageArray });

		let found = false;
		conv.forEach((value) => {
			if (value[0] === messageArray[1]) {
				found = true;
				return;
			}
		});
		if (!found) {
			sms.sendSms(phoneNumber, 'This user has not sent any message. Add "force" to enforce this ban.');
		}

	}


	const banList: Array<[string, Date]> = JSON.parse(fs.readFileSync('./datas/banList.json')?.toString() ?? '[]');
	const EndDate = new Date(messageArray[2] ? Date.now() + (parseInt(messageArray[2]) * 1000) : 8640000000000000)
	banList.push([messageArray[1], EndDate]);
	fs.writeFileSync('./datas/banList.json', JSON.stringify(banList));

	sms.sendSms(phoneNumber, 'User banned');
	sms.sendSms(messageArray[1], 'You\'ve been banned by an administrator');
}

function unban(phoneNumber: string, message: string, sms: sms) {
	console.log('coucou');
	const messageArray = message.split(' ');
	if (messageArray.length != 2) {
		sms.sendSms(phoneNumber, 'Syntax: unban <number>');
		return;
	}
	if (!IsPhoneNumber(messageArray[1])) {
		sms.sendSms(phoneNumber, 'Syntax: unban <number>');
		return;
	}

	const banList: Array<[string, Date]> = JSON.parse(fs.readFileSync('./datas/banList.json')?.toString() ?? '[]');
	if (banList.length == 0) sms.sendSms(phoneNumber, 'no banned user');
	let unbanned = false;
	banList.forEach((element, i) => {
		if (element[0] == messageArray[1]) {
			element.splice(i, 1);
			sms.sendSms(phoneNumber, 'user ' + messageArray[1] + ' unbanned');
			unbanned = true;
		}
	});
	if (!unbanned) {
		sms.sendSms(phoneNumber, 'user ' + messageArray[1] + ' not found');
	}
}