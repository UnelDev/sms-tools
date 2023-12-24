import llamaServer from './services/LLamaServer/LlamaServer';
import Service from './services/Service';
import util from './services/Util';
import Wikipedia from './services/Wikipedia';
import restore from './tools/restore';
import sendSms from './tools/sendSms';
import { bolderize, findUserByPhone } from './tools/tools';
import User from './user/User';

class Switchboard {
	services: Array<Service> = [];
	private users: Array<User> = restore();
	constructor() {
		this.services.push(new util());
		this.services.push(new llamaServer());
		this.services.push(new Wikipedia());
	}
	main(phoneNumber: string, message: string) {
		message = message.toLowerCase();
		if (!this.isActivePhone(phoneNumber)) {
			//new user
			this.users.push(new User(phoneNumber));
		} else {
			const tmpUrs = findUserByPhone(this.users, phoneNumber);
			if (typeof tmpUrs != 'undefined' && typeof tmpUrs.activeService != 'undefined') {
				//user with service
				if (message.split(' ')[0] == 'home') {
					tmpUrs.activeService = undefined;
					tmpUrs.otherInfo = new Map();
					message = message.replace('home', '');
					message = message.trim();
				} else {
					tmpUrs.activeService.newAction(tmpUrs, message);
					return;
				}
			}
		}
		this.mainMenu(phoneNumber, message);
	}

	private mainMenu(phoneNumber: string, message: string) {
		const serviceNumber = parseInt(message.split(' ')[0]);
		if (!isNaN(serviceNumber) || serviceNumber < this.services.length || serviceNumber >= 0) {
			this.selectApp(phoneNumber, message);
			return;
		}
		const serviceList = this.services
			.map((service, i) => {
				let options = '';
				if (service.lock) {
					options = '(locked)';
				}
				if (this.detectConflicts(service)) {
					options += '(conflict)';
				}
				return '\n' + i + ': ' + service.name + ' ' + bolderize(options);
			})
			.join('');
		sendSms(phoneNumber, `Select an application: ${serviceList}`);
	}

	private selectApp(phoneNumber: string, message: string) {
		const tmpUrs = findUserByPhone(this.users, phoneNumber);

		if (typeof tmpUrs == 'undefined') return;

		const serviceNumber = parseInt(message.split(' ')[0]);

		//remove number
		const tmpmessage = message.split(' ');
		tmpmessage.shift();
		message = tmpmessage.join(' ');
		message = message.trim();

		this.services[serviceNumber].newAction(tmpUrs, message);
		tmpUrs.activeService = this.services[serviceNumber];
	}

	private detectConflicts(currentService: Service) {
		return this.services.some(el => el.started && currentService.conflic.includes(el.name));
	}

	private isActivePhone(phoneNumber: string) {
		return this.users.some(usr => usr.phoneNumber == phoneNumber);
	}
}

export default Switchboard;
