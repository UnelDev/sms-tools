import fs from "fs";
import sms from "./smsSender";

export default class admin {
	phoneNumber: string;
	actionHistory: Array<[Date, string]>
	receviedHistory: Array<string>;
	sendHistory: Array<string>;
	constructor(phoneNumber: string) {
		this.phoneNumber = phoneNumber;
		this.receviedHistory = [];
		this.sendHistory = [];
		this.actionHistory = [];
		this.save();
	}

	sendMessage(message: string, smsAPI: sms) {
		this.sendHistory.push(message);
		smsAPI.sendSms(this.phoneNumber, message);
		this.save();
	}

	async save() {
		try {
			let adminArray: Array<admin> = [];
			if (fs.existsSync('./datas/adminSave.json')) {
				adminArray = JSON.parse(fs.readFileSync('./datas/adminSave.json').toString());
				const index = adminArray.findIndex((u) => u.phoneNumber === this.phoneNumber);
				if (index !== -1) {
					adminArray[index] = this;
				} else {
					adminArray.push(this);
				}
			} else {
				adminArray.push(this);
			}
			fs.writeFileSync('./datas/adminSave.json', JSON.stringify(adminArray));
		} catch (err) {
			console.error('Error while saving admin:', err);
		}
	}
}