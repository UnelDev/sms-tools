import chalk from "chalk";
import llama from "./llama";
import sms from "./smsSender";
import fs from "fs";

export default class user {
	phoneNumber: string;
	firstMessage: boolean;
	receviedHistory: Array<string>;
	sendHistory: Array<string>;
	banished: Date;
	constructor(phoneNumber: string) {
		this.phoneNumber = phoneNumber;
		this.firstMessage = false;
		this.receviedHistory = [];
		this.sendHistory = [];
		this.banished = new Date(0);
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
		if (this.banished > new Date()) {
			console.log(chalk.red("from baned user") + ": " + message);
			return (true);
		}
		if (message.replace('\n', '').replace(' ', '') == '') { return (false) };
		message.trim();
		this.firstMessageCheck(smsAPI);
		this.receviedHistory.push(message);
		this.save();

		llamaAPI.send(message, answer => {
			this.sendMessage(answer, smsAPI);
			console.log('[' + chalk.green('LLama response') + '] \'' + answer);
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
			this.sendMessage('congratulations, you have send your first message, warning all data send by bob can be wrong. good disscution', smsAPI);
		}
	}

}