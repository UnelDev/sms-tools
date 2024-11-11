import { Message } from './models/message';
import { log } from './tools/log';
import sendSms from './tools/sendSms';
import { clearPhone } from './tools/tools';

async function messageRecevied(message: string, phoneNumber: string, messageId: string) {
	const phone = clearPhone(phoneNumber);
	if (!phone) {
		log('Bad phone:', 'ERROR', __filename, phone, 'root');
		return;
	}

	log(`Message received`, 'INFO', __filename, message, phoneNumber);
	const messageObj = new Message({
		contactID: phoneNumber,
		message,
		direction: true,
		status: 'received',
		messageId,
		deliveredAt: new Date()
	}).save();

	await messageObj;
	sendSms(phoneNumber, 'revevied');
}

export default messageRecevied;
