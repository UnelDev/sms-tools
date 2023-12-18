import sendSms from '../tools/sendSms';
import User from '../user/User';

class Service {
	name: string = 'null';
	lock: boolean = false;
	conflic: Array<string> = []; // no effect if start == false
	started: boolean = false; // no effect if lock == false
	constructor() {}
	newAction(user: User, message: string) {
		sendSms(user.phoneNumber, 'Hello, you sent' + message);
	}
}

export default Service;
