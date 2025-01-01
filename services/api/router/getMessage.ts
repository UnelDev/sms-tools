import { Request, Response } from 'express';
import { Message } from '../../../models/message.model';
import authenticate from '../authentificate';
import { checkParameters, clearPhone, getContact, getUser, phoneNumberCheck } from '../../../tools/tools';
import { log } from '../../../tools/log';

async function getMessage(req: Request<any>, res: Response<any>) {
	const user = authenticate(req, res);
	if (
		!user ||
		!checkParameters(
			req.body,
			res,
			[
				['ContactID', 'ObjectId', true],
				['phoneNumber', 'string', true],
				['page', 'number', true],
				['size', 'number', true]
			],
			__filename
		)
	)
		return;
	if (req.body.size && req.body.size > 200) {
		log('too big querry', 'WARNING', __filename, { size: req.body.size }, user.id);
		res.status(418).send('to big request');
		return;
	}

	if (!req.body.ContactID && !req.body.phoneNumber) {
		log('no mutch argument', 'WARNING', __filename, { size: req.body.size }, user.id);
		res.status(400).send('at least one of these two arguments must be provided: ContactID, phoneNumber');
		return;
	}

	if (!req.body.ContactID) {
		const phone = clearPhone(req.body.phoneNumber);
		if (!phoneNumberCheck(phone)) {
			log('bad contact phone number', 'WARNING', __filename, { size: req.body.size }, user.id);
			res.status(400).json({ OK: false, message: 'bad phone number' });
		}
		const contact = await getContact(phone);
		if (!contact || !contact._id) {
			log('contact not found', 'WARNING', __filename, { size: req.body.size }, user.id);
			res.status(404).json({ OK: false, message: 'contact not found' });
			return;
		}
		req.body.ContactID = contact._id;
	}

	const size = req.body.size ?? 50;
	const msgList: Array<InstanceType<typeof Message>> = [];
	await Message.find({ contactID: req.body.ContactID }, null, {
		limit: size,
		skip: req.body.page ?? 0 * size
	})
		.sort({ sendAt: -1 })
		.cursor()
		.eachAsync(msg => {
			msgList.push(msg);
		});
	log('user reqested ' + msgList.length + ' messages', 'INFO', __filename, { size: req.body.size }, user.id);
	res.status(200).send({ message: msgList.length + ' data send', data: msgList, OK: true });
}

export default getMessage;
