import chalk from 'chalk';
import fs from 'fs';

import llama from './llama';
import sendSms from './smsSender';

export default class user {
	phoneNumber: string;
	receviedHistory: Array<string>;
	sendHistory: Array<string>;
	isBan: Date;
	lastMessage: Date;
	constructor(
		phoneNumber: string,
		receviedHistory = [],
		sendHistory = [],
		isBan = new Date(0),
		lastMessage = new Date(0)
	) {
		this.phoneNumber = phoneNumber;
		this.receviedHistory = receviedHistory;
		this.sendHistory = sendHistory;
		this.isBan = isBan;
		this.lastMessage = lastMessage;
		this.save();
	}

	sendMessage(message: string) {
		this.sendHistory.push(message);
		sendSms(this.phoneNumber, message);
		this.save();
	}

	newMessage(message: string, llamaAPI: llama, curentHistory: Array<[Date, string, string]>) {
		if (this.isBan > new Date()) {
			console.log(chalk.red('From banned user') + ': ' + message);
		}
		if (message.replace('\n', '').replace(' ', '') == '') {
			return;
		}
		this.receviedHistory.push(message);
		curentHistory.push([new Date(), this.phoneNumber, message]);
		this.save();

		llamaAPI.send(message, answer => {
			console.log('[' + chalk.green('LLama response') + "] '" + answer + "'");
			curentHistory.push([new Date(), this.phoneNumber, answer]);
			this.sendMessage(answer);
		});
	}

	async save() {
		try {
			let userArray: Array<user> = [];
			if (!fs.existsSync('./datas/')) {
				fs.mkdirSync('./datas/');
			}
			if (fs.existsSync('./datas/UserSave.json')) {
				userArray = JSON.parse(fs.readFileSync('./datas/UserSave.json').toString());
				const index = userArray.findIndex(u => u.phoneNumber === this.phoneNumber);
				if (index !== -1) {
					userArray[index] = this;
				} else {
					userArray.push(this);
				}
			} else {
				userArray.push(this);
			}
			fs.writeFileSync('./datas/UserSave.json', JSON.stringify(userArray));
		} catch (err) {
			console.error('Error while saving user:', err);
		}
	}
}
