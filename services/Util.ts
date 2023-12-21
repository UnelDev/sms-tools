import sendSms from '../tools/sendSms';
import { IsPhoneNumber, bolderize } from '../tools/tools';
import User from '../user/User';
import service from './Service';

class Util extends service {
	constructor() {
		super();
		this.name = 'util';
	}
	newAction(user: User, message: string) {
		if (user.otherInfo.get('Util_Action') == 'sendAt') {
			this.sendAt(user, message);
			return;
		}
		if (message == 'ping') {
			user.sendMessage('Pong!');
		} else if (message.startsWith('sendat')) {
			user.otherInfo.set('Util_Action', 'sendAt');
			message = message.replace('sendat ', '');
			this.sendAt(user, message);
		} else {
			user.sendMessage(
				`You have selected the ${bolderize('Util')} service. List of command: %0a
				${bolderize('ping')}: Reply pong%0a
				${bolderize('sendAt')}: send your message an another person%0a%0a
				${bolderize('home')}: Go back to the main menu`
			);
		}
	}

	private sendAt(user: User, message: string) {
		if (user.otherInfo.get('Util_recPhone') == undefined) {
			const messageSplit = message.split(' ');
			if (IsPhoneNumber(messageSplit[0])) {
				user.otherInfo.set('Util_recPhone', messageSplit[0]);
				messageSplit.shift();
				message = messageSplit.join(' ');
			} else {
				user.sendMessage('Send me the phone number of the recipient');
				return;
			}
		}

		if (user.otherInfo.get('Util_date') == undefined) {
			if (message.trim() == '') {
				user.sendMessage('Select the date the message should be sent. eg: 20/12/23 23:28');
				return;
			}
			const messageSplit = message.split(' ');
			const date = this.ConvertInMs(messageSplit[0] + ' ' + messageSplit[1]);
			if (date == undefined) {
				user.sendMessage('Invalid date, retry... eg: 20/12/23 23:28');
				return;
			}
			if (date.getTime() - Date.now() < 0) {
				user.sendMessage('This date is in the past, try another one. eg: 20/12/23 23:28');
				return;
			}

			user.otherInfo.set('Util_date', date);
			messageSplit.shift();
			messageSplit.shift();
			message = messageSplit.join(' ');
		}

		if (user.otherInfo.get('Util_Message') == undefined) {
			if (message.trim() != '') {
				user.otherInfo.set('Util_Message', message.trim());
				user.sendMessage(
					'You want to send: "' +
						message.trim() +
						'" to the "' +
						user.otherInfo.get('Util_recPhone') +
						'this messge will be sent at ' +
						user.otherInfo.get('Util_date').toLocaleString('en-GB') +
						'.%0ay/n'
				);
			} else {
				user.sendMessage('give me the message');
				return;
			}

			const messageSplit = message.split(' ');
			messageSplit.shift();
			message = messageSplit.join(' ');
		}

		if (message.toLowerCase() == 'y' || message.toLowerCase() == 'yes') {
			if (user.otherInfo.get('Util_date').getTime() - Date.now() < 0) {
				sendSms(
					user.otherInfo.get('Util_recPhone'),
					user.otherInfo.get('Util_Message') + '%0a%0a' + bolderize("message forwarded you can't reply")
				);
			} else {
				setTimeout(() => {
					sendSms(
						user.otherInfo.get('Util_recPhone'),
						user.otherInfo.get('Util_Message') + '%0a%0a' + bolderize("message forwarded you can't reply")
					);
				}, user.otherInfo.get('Util_date').getTime() - Date.now());
			}
		}
	}

	private ConvertInMs(dateString: string): Date | undefined {
		if (!/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/.test(dateString)) return undefined;

		console.log(dateString);
		const [datePart, timePart] = dateString.split(' ');
		const [day, month, year] = datePart.split('/');
		const [hours, minutes] = timePart.split(':');

		const isoDateString = `20${year}-${month}-${day} ${hours}:${minutes}`;
		console.log(isoDateString);
		const dateObject = new Date(isoDateString);

		if (isNaN(dateObject.getTime())) {
			return undefined;
		}

		return dateObject;
	}
}

export default Util;
