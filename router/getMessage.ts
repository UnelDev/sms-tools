import { Request, Response } from 'express';
import { Message } from '../models/message.model';
import authenticate from '../tools/authentificate';
import { checkParameters } from '../tools/tools';

async function getMessage(req: Request<any>, res: Response<any>) {
	const user = authenticate(req, res);
	if (
		!user ||
		!checkParameters(
			req.body,
			res,
			[
				['ContactID', 'ObjectId'],
				['page', 'number', true],
				['size', 'number', true]
			],
			__filename
		)
	)
		return;
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
