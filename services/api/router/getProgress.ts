import { Request, Response } from 'express';
import authenticate from '../../../tools/authentificate';
import { Message } from '../../../models/message.model';
import { log } from '../../../tools/log';

async function getProgress(req: Request<any>, res: Response<any>) {
	req.body.ContactID = '67463daade8609f23e827fb7';
	const user = authenticate(req, res);
	if (!user) return;

	const count = await Message.aggregate([
		{ $match: { direction: false } },
		{ $group: { _id: '$contactID' } },
		{ $count: 'uniqueClients' }
	]);

	res.status(200).send({ message: 'nbUser', data: { total: count[0]?.uniqueClients || 0 }, OK: true });
	log('user get the number of client', 'INFO', __dirname, { user }, user.id);
}

export default getProgress;
