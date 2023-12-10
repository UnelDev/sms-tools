import sendSms from '../tools/sendSms';
import User from '../user/User';

class Service {
	name: string = 'null';
	block: boolean = false;
	conflic: Array<string> = []; // no effect if start == false
	started: boolean = false; // no effect if block == false
	constructor() {}
	newAction(user: User, message: string) {
		sendSms(user.phoneNumber, 'hello, you have send ' + message);
	}
}

export default Service;
