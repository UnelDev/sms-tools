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
			sendSms(user.phoneNumber, 'Pong!');
		} else {
			sendSms(
				user.phoneNumber,
				`You have selected the ${bolderize('Util')} service. List of command: %0a
				${bolderize('ping')}: Reply pong%0a%0a

				${bolderize('home')}: Go back to the main menu`
			);
		}
	}
}

export default Util;
