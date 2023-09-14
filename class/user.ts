import chalk from "chalk";
import llama from "./llama";
import sms from "./smsSender";
import fs from "fs";

export default class user {
	phoneNumber: string;
	firstMessage: boolean;
	receviedHistory: Array<string>;
	sendHistory: Array<string>;
	isBan: Date;
	constructor(phoneNumber: string, firstMessage = false, receviedHistory = [], sendHistory = [], isBan = new Date(0)) {
		this.phoneNumber = phoneNumber;
		this.firstMessage = firstMessage;
		this.receviedHistory = receviedHistory;
		this.sendHistory = sendHistory;
		this.isBan = isBan;
		this.save();
	}

	sendMessage(message: string, smsAPI: sms) {
		this.firstMessageCheck(smsAPI);
		this.sendHistory.push(message);
		smsAPI.sendSms(this.phoneNumber, message);
		this.save();
	}

	newMessage(phoneNumber: string, message: string, smsAPI: sms, llamaAPI: llama): boolean {
		if (phoneNumber != this.phoneNumber) { return (false) };
		if (this.isBan > new Date()) {
			console.log(chalk.red("from baned user") + ": " + message);
			return (true);
		}
		if (message.replace('\n', '').replace(' ', '') == '') { return (false) };
		this.firstMessageCheck(smsAPI);
		this.receviedHistory.push(message);
		this.save();

		llamaAPI.send(message, answer => {
			console.log('[' + chalk.green('LLama response') + '] \'' + answer + '\'');
			this.sendMessage(answer, smsAPI);
		});
		return (true);
	}

	async save() {
		try {
			let userArray: Array<user> = [];
			if (fs.existsSync('./datas/UserSave.json')) {
				userArray = JSON.parse(fs.readFileSync('./datas/UserSave.json').toString());
				const index = userArray.findIndex((u) => u.phoneNumber === this.phoneNumber);
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
			this.sendMessage('congratulations, you have send your first message, warning all data send by bob can be wrong. good disscution', smsAPI);
		}
	}

}