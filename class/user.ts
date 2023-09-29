import chalk from 'chalk';
import fs from 'fs';

import llama from './llama';
import sms from './smsSender';

export default class user {
	phoneNumber: string;
	firstMessage: boolean;
	receviedHistory: Array<string>;
	sendHistory: Array<string>;
	isBan: Date;
	lastMessage: Date;
	constructor(
		phoneNumber: string,
		firstMessage = false,
		receviedHistory = [],
		sendHistory = [],
		isBan = new Date(0),
		lastMessage = new Date(0)
	) {
		this.phoneNumber = phoneNumber;
		this.firstMessage = firstMessage;
		this.receviedHistory = receviedHistory;
		this.sendHistory = sendHistory;
		this.isBan = isBan;
		this.lastMessage = lastMessage;
		this.save();
	}

	sendMessage(message: string, smsAPI: sms) {
		this.firstMessageCheck(smsAPI);
		this.sendHistory.push(message);
		smsAPI.sendSms(this.phoneNumber, message);
		this.save();
	}

	newMessage(message: string, smsAPI: sms, llamaAPI: llama, curentHistory: Array<[Date, string, string]>) {
		if (this.isBan > new Date()) {
			console.log(chalk.red('From banned user') + ': ' + message);
		}
		if (message.replace('\n', '').replace(' ', '') == '') {
			return;
		}
		this.firstMessageCheck(smsAPI);
		this.receviedHistory.push(message);
		curentHistory.push([new Date(), this.phoneNumber, message]);
		this.save();

		llamaAPI.send(message, answer => {
			console.log('[' + chalk.green('LLama response') + "] '" + answer + "'");
			curentHistory.push([new Date(), this.phoneNumber, answer]);
			this.sendMessage(answer, smsAPI);
		});
	}

	async save() {
		try {
			let userArray: Array<user> = [];
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

	private firstMessageCheck(smsAPI: sms) {
		if (!this.firstMessage) {
			this.firstMessage = true;
			this.save();
			this.sendMessage(
				'Congratulations, you have sent your first message.\nNotice: Any data sent by Bob can be wrong or harmful. Good discussion!',
				smsAPI
			);
		}
	}
}
