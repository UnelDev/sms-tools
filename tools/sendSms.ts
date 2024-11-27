import { ObjectId } from 'mongoose';
import { Contact } from '../models/contact.model';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { log } from './log';
import { clearPhone } from './tools';
class SmsSender {
	timeBetwenSend: number;
	pending: Array<{
		phoneNumber: String;
		message: string;
		messageObj: Promise<InstanceType<typeof Message>>;
		initiator?: string;
	}>;
	runing: boolean;
	constructor() {
		this.timeBetwenSend = 5000;
		this.pending = [];
		this.runing = false;
	}

	private async sendMessage() {
		if (this.runing) return;
		if (this.pending.length == 0) {
			this.runing = false;
			return;
		}
		const msg = this.pending.shift();
		if (!msg) {
			this.runing = false;
			return;
		}
		this.runing = true;

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization:
					'Basic ' + Buffer.from(`${process.env.SMS_USERNAME}:${process.env.PASSWORD}`).toString('base64')
			},
			body: JSON.stringify({
				message: msg?.message,
				phoneNumbers: [msg?.phoneNumber]
			})
		};
		const res = await (await fetch(process.env.GATEWAY_URL + '/message', options)).json();
		if (!res.id) {
			log('Error sending message: ' + res, 'ERROR', __filename, msg.initiator);
		} else {
			await Message.findByIdAndUpdate((await msg.messageObj).id, { messageId: res.id });
			log('Message sent', 'INFO', __filename, { message: msg.message, contact: msg.phoneNumber }, msg.initiator);
		}

		if (this.pending.length != 0) {
			this.runing = false;
			return;
		}
		setTimeout(this.sendMessage, this.timeBetwenSend);
	}

	async sendSms(
		contact: InstanceType<typeof Contact>,
		message: string,
		initiator?: string,
		sendUser?: InstanceType<typeof User>
	): Promise<void>;
	async sendSms(
		contact: InstanceType<typeof User>,
		message: string,
		initiator?: string,
		sendUser?: InstanceType<typeof User>
	): Promise<void>;
	async sendSms(
		contact: InstanceType<typeof Contact> | InstanceType<typeof User>,
		message: string,
		initiator: string = 'root',
		sendUser?: InstanceType<typeof User>
	): Promise<void> {
		const phone = clearPhone(contact.phoneNumber);
		if (!phone) {
			log('Bad phone:', 'ERROR', __filename, { message, contact }, initiator);
			return;
		}

		const messageObj = new Message({
			contactID: contact._id,
			message,
			direction: false,
			sendUser
		}).save();

		this.pending.push({ phoneNumber: phone, message, messageObj });
	}
}

async function sendSms2(
	contact: InstanceType<typeof Contact>,
	message: string,
	initiator?: string,
	sendUser?: InstanceType<typeof User>
): Promise<void>;
async function sendSms2(
	contact: InstanceType<typeof User>,
	message: string,
	initiator?: string,
	sendUser?: InstanceType<typeof User>
): Promise<void>;
async function sendSms2(
	contact: InstanceType<typeof Contact> | InstanceType<typeof User>,
	message: string,
	initiator: string = 'root',
	sendUser?: InstanceType<typeof User>
): Promise<void> {
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

export { sendSms2 as sendSms, SmsSender };
