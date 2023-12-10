import service from '../services/Service';

class User {
	lastMessage: Date;
	activeService: service = undefined;
	phoneNumber: string;
	constructor(phoneNumber: string, lastMessage: Date = new Date(0)) {
		this.phoneNumber = phoneNumber;
		this.lastMessage = lastMessage;
	}
}

export default User;
