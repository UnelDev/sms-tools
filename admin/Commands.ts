
import * as dotenv from 'dotenv';
import fs from 'fs';

import models from '../models';
import sms from '../smsSender';
import { IsPhoneNumber } from '../Utils';

dotenv.config();

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
		sms.sendSms(phoneNumber, 'The model respond in ' + (Date.now() - start) + 'ms');
	});
}

function restart(phoneNumber: string, model: models, sms: sms) {
	sms.sendSms(phoneNumber, 'Restarting system...');
	model.restart();
}
function ban(phoneNumber: string, message: string, sms: sms) {
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

	const banList: Array<[string, Date]> = JSON.parse(fs.readFileSync('./admin/ban.json')?.toString() ?? '[]');
	const EndDate = new Date(messageArray[2] ? Date.now() + (parseInt(messageArray[2]) * 1000) : 8640000000000000)
	banList.push([messageArray[1], EndDate]);
	fs.writeFileSync('./datas/banList.json', JSON.stringify(banList));

	sms.sendSms(phoneNumber, 'User banned');
	sms.sendSms(messageArray[1], 'You\'ve been banned by an administrator');
}

export default function adminAction(phoneNumber: string, message: string, model: models, sms: sms) {
	if (!process.env.ADMIN_NUMBER?.includes(phoneNumber)) {
		sms.sendSms(phoneNumber, 'Insufficient permissions');
		return;
	}

	message = CleanMessage(message);
	const command = message.split(' ')[0];

	if (command == 'restart') {
		restart(phoneNumber, model, sms);
	} else if (command == 'ping') {
		ping(phoneNumber, model, sms);
	} else if (command == 'ban') {
		ban(phoneNumber, message, sms);
	} else {
		sms.sendSms(phoneNumber, 'Unknown command \'' + command + '\'');
	}
}