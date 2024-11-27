import { Message } from './models/message.model';
import ServicesClass from './services/service';
import { log } from './tools/log';
import { SmsSender } from './tools/sendSms';
import { bolderize, clearPhone, createUser, getUser } from './tools/tools';

async function messageRecevied(
	message: string,
	phoneNumber: string,
	messageId: string,
	servicesClass: Promise<Array<ServicesClass>>,
	smsSender: SmsSender
) {
	message = message.trim().toLowerCase();
	const phone = clearPhone(phoneNumber);
	if (!phone) {
		log('Bad phone:', 'ERROR', __filename, phone, 'root');
		return;
	}
	let user = await getUser(phone);
	if (!user) {
		const usr = await createUser(phone);
		if (usr) {
			user = usr;
		} else {
			log('error on creating user', 'CRITICAL', __filename, { phone, message });
			return;
		}
	}
	log(`Message received`, 'INFO', __filename, { message, user }, user?._id.toString());
	const messageObj = new Message({
		senderID: user._id,
		message,
		direction: true,
		status: 'received',
		messageId,
		deliveredAt: new Date()
	}).save();
	//go to home menu
	if (message.startsWith('home') || message.startsWith("'home")) {
		message = message.replace('home', '');
		message = message.replace("'home", '');
		message = message.trim();
		user.currentServices = 'nothing';
		await user.save();
		log('user is go to home menu', 'INFO', __filename, { user });
	}

	if (user.commandPermeted) {
		//bypass command (after home command)
		(await servicesClass).forEach(async serv => {
			if (serv.type == 'command' && serv.bypassTrigger.find(e => e == message)) {
				log(
					`Message transfered for bypass to ${serv.name}`,
					'INFO',
					__filename,
					{ message, user, serv },
					serv.name
				);
				serv.newMessage(user, message, smsSender);
			}
		});
		//if user is in service
		if (user.currentServices != 'nothing') {
			const service = (await servicesClass).find(e => e.name == user.currentServices);
			if (!service) user.currentServices == 'nothing';
			else {
				service.newMessage(user, message, smsSender);
				return;
			}
		}

		const messageSplit = message.split(' ');
		const firstWorld = messageSplit.at(0);
		const firstWorldNumber = parseInt(firstWorld ?? 'a');
		//if first part is an number
		if (!isNaN(firstWorldNumber)) {
			const service = (await servicesClass).at(firstWorldNumber);
			if (service) {
				await user.updateOne({ currentServices: service.name });
				//if only one argument
				if (messageSplit.length == 1) {
					log('user is enter in services', 'INFO', __filename, { user, service });
					service.newMessage(user, messageSplit.slice(1).join(' '), smsSender);
				}
				return;
			}
		}

		//if first part is an service name
		if (firstWorld) {
			const serv = (await servicesClass).find(e => e.name == firstWorld);
			if (serv) {
				await user.updateOne({ currentServices: serv.name });
				//if only one argument
				if (messageSplit.length == 1) {
					log('user is enter in services', 'INFO', __filename, { user, serv });
					serv.newMessage(user, messageSplit.slice(1).join(' '), smsSender);
				}
				return;
			}
		}

		//other case
		smsSender.sendSms(
			user,
			`Select an application:
${(await servicesClass).map((el, i) => {
	return bolderize(i.toString() + ': ' + el.name) + ' ' + el.description + '\n';
})}
${bolderize('home')}: return on this menu`
		);
	} else {
		(await servicesClass).forEach(async serv => {
			if (serv.type == 'message') {
				log(`Message transfered to ${serv.name}`, 'INFO', __filename, { message, user, serv }, serv.name);
				serv.newMessage(user, message, smsSender);
			}
		});
	}
	await messageObj;
}

export default messageRecevied;
