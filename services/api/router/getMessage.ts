import { Request, Response } from 'express';
import { Message } from '../../../models/message.model';
import authenticate from '../../../tools/authentificate';
import { checkParameters, clearPhone, getUser } from '../../../tools/tools';

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
		res.status(418).send('to big request');
		return;
	}

	if (!req.body.ContactID && !req.body.phoneNumber) {
		res.status(400).send('at least one of these two arguments must be provided: ContactID, phoneNumber');
		return;
	}

	if (!req.body.ContactID) {
		const phone = clearPhone(req.body.phoneNumber);
		const user = await getUser(phone);
		if (!user || user._id) {
			res.status(404).json({ OK: false, message: 'no user found' });
			return;
		}
		req.body.ContactID = user._id;
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
	res.status(200).send({ message: msgList.length + ' data send', data: msgList, OK: true });
}

export default getMessage;
