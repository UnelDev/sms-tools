import { Message } from '../models/message';
import { log } from './log';
import { clearPhone } from './tools';
import { Contact } from '../models/contact';
import { User } from '../models/user';
async function sendSms(
	contact: InstanceType<typeof Contact>,
	message: string,
	initiator: string = 'root',
	sendUser?: InstanceType<typeof User>
) {
	const phone = clearPhone(contact.phoneNumber);
	if (!phone) {
		log('Bad phone:', 'ERROR', __filename, { message, contact }, initiator);
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
			phoneNumbers: [phone]
		})
	};

	const messageObj = new Message({
		contactID: contact._id,
		message,
		direction: false,
		sendUser
	}).save();
	const res = await (await fetch(process.env.GATEWAY_URL + '/message', options)).json();
	if (!res.id) {
		log('Error sending message: ' + res, 'ERROR', __filename, initiator);
		return;
	}
	await Message.findByIdAndUpdate((await messageObj)._id, { messageId: res.id });
	log('Message sent', 'INFO', __filename, { message, contact }, initiator);
}

export { sendSms };
