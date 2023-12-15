import sendSms from '../tools/sendSms';
import { bolderize } from '../tools/tools';
import User from '../user/User';
import service from './Service';

class Util extends service {
	constructor() {
		super();
		this.name = 'util';
	}
	newAction(user: User, message: string) {
		if (message == 'ping') {
			sendSms(user.phoneNumber, 'pong');
		} else {
			sendSms(
				user.phoneNumber,
				`you have selected ${bolderize('Util')} servces. list of command: %0a
				${bolderize('ping')}: reply pong%0a%0a
				 
				${bolderize('home')}: go to main menu`
			);
		}
	}
}
export default Util;
