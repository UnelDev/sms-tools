import chalk from 'chalk';
import { Message } from '../models/message';
import { log } from './log';
import { clearPhone } from './tools';
async function sendSms(phoneNumber: string, message: string, initiator: string = 'root') {
	const phone = clearPhone(phoneNumber);
	if (!phone) {
		log('Bad phone:', 'ERROR', __filename, phone, initiator);
		return;
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization:
				'Basic ' + Buffer.from(`${process.env.SMS_USERNAME}:${process.env.PASSWORD}`).toString('base64')
		},
		body: JSON.stringify({
			message,
			phoneNumbers: [phoneNumber]
		})
	};

	const messageObj = new Message({
		contactID: phoneNumber,
		message,
		direction: false
	}).save();
	const res = await (await fetch(process.env.GATEWAY_URL + '/message', options)).json();
	if (!res.id) {
		log('Error sending message: ' + res, 'ERROR', __filename, initiator);
		return;
	}
	await Message.findByIdAndUpdate((await messageObj)._id, { messageId: res.id });
	log('Message sent', 'INFO', __filename, message, initiator);
}

export default sendSms;
