import { Request, Response } from 'express';
import mongoose from 'mongoose';
import authenticate from '../../../tools/authentificate';
import { checkParameters } from '../../../tools/tools';
import { log } from '../../../tools/log';

async function getNewMessage(
	req: Request<any>,
	res: Response<any>,
	SseSuscriber: Map<mongoose.Types.ObjectId, Array<(message: string) => void>>
) {
	req.body.ContactID = '67463daade8609f23e827fb7';
	const user = authenticate(req, res);
	if (!user || !checkParameters(req.body, res, [['ContactID', 'ObjectId']], __filename)) return;

	res.writeHead(200, {
		Connection: 'keep-alive',
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/event-stream'
	}); // flush the headers to establish SSE with client

	if (SseSuscriber.has(req.body.ContactID)) {
		const suscribe = SseSuscriber.get(req.body.ContactID) ?? new Array<() => void>();
		suscribe?.push((message: string) => {
			console.log('ress send');
			res.write(`data: ${JSON.stringify(message)}\n\n`);
		});
		SseSuscriber.set(req.body.ContactID, suscribe);
	}

	res.on('close', () => {
		// log('client of sse droped connection', 'INFO', __filename, { id: user.id });
		res.end();
	});
}

export default getNewMessage;
