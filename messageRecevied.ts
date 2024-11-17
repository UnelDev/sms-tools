import { Message } from './models/message';
import ServicesClass from './services/service';
import { log } from './tools/log';
import { clearPhone } from './tools/tools';
import { createContact, getContact } from './tools/utils';

async function messageRecevied(
	message: string,
	phoneNumber: string,
	messageId: string,
	servicesClass: Promise<Array<ServicesClass>>
) {
	message = message.trim().toLocaleLowerCase();
	const phone = clearPhone(phoneNumber);
	if (!phone) {
		log('Bad phone:', 'ERROR', __filename, phone, 'root');
		return;
	}
	let contact = await getContact(phone);
	if (!contact) {
		const usr = await createContact(phone);
		if (usr) {
			contact = usr;
		} else {
			log('error on creating contact', 'CRITICAL', __filename, { phone, message });
			return;
		}
	}
	log(`Message received`, 'INFO', __filename, { message, contact }, contact?._id.toString());
	const messageObj = new Message({
		contactID: contact._id,
		message,
		direction: true,
		status: 'received',
		messageId,
		deliveredAt: new Date()
	}).save();

	await messageObj;
	(await servicesClass).forEach(async serv => {
		if (serv.bypassTrigger.find(e => e == message)) {
			log(
				`Message transfered for bypass to ${serv.name}`,
				'INFO',
				__filename,
				{ message, contact, serv },
				serv.name
			);
			serv.newMessage(contact, message);
		}
	});
	if (message.startsWith("'")) {
		const command = message.slice(1).trim();
		(await servicesClass).forEach(async serv => {
			if (serv.type == command && serv.commands.find(e => e == command)) {
				log(
					`Message transfered for command to ${serv.name}`,
					'INFO',
					__filename,
					{ message, contact, serv },
					serv.name
				);
				serv.newMessage(contact, command);
			}
		});
	}
	(await servicesClass).forEach(async serv => {
		if (serv.type == 'message') {
			log(`Message transfered to ${serv.name}`, 'INFO', __filename, { message, contact, serv }, serv.name);
			serv.newMessage(contact, message);
		}
	});
}

export default messageRecevied;
