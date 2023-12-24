import service from '../services/Service';
import sendSms from '../tools/sendSms';
import fs from 'fs';

class User {
	lastMessage: Date;
	activeService: service | undefined = undefined;
	phoneNumber: string;
	otherInfo: Map<string, any>; //key most be serviceName_key
	constructor(phoneNumber: string, lastMessage: Date = new Date(0), otherInfo = new Map()) {
		this.phoneNumber = phoneNumber;
		this.lastMessage = lastMessage;
		this.otherInfo = otherInfo;
	}

	sendMessage(message: string) {
		sendSms(this.phoneNumber, message);
	}

	async save() {
		try {
			let userArray: Array<User> = [];
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
			fs.mkdir('./datas/', { recursive: true }, err => {
				if (err) throw err;
			});
			fs.writeFileSync('./datas/UserSave.json', JSON.stringify(userArray, replacer));
			function replacer(key: string, value: any) {
				if (value instanceof Map) {
					return {
						dataType: 'Map',
						value: Array.from(value.entries()) // or with spread: value: [...value]
					};
				} else {
					return value;
				}
			}
		} catch (err) {
			console.error('Error while saving user:', err);
		}
	}
}

export default User;
