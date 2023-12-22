import service from '../services/Service';
import sendSms from '../tools/sendSms';

class User {
	lastMessage: Date;
	activeService: service | undefined = undefined;
	phoneNumber: string;
	otherInfo: Map<string, any> = new Map(); //key most be serviceName_key
	constructor(phoneNumber: string, lastMessage: Date = new Date(0)) {
		this.phoneNumber = phoneNumber;
		this.lastMessage = lastMessage;
	}

	sendMessage(message: string) {
		sendSms(this.phoneNumber, message);
	}
}

export default User;
