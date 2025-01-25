import { Router } from 'express';
import { Message } from '../../models/message.model';
import { SmsSender } from '../../tools/sendSms';
import createContact from './router/createContact';
import getMessage from './router/getMessage';
import getNewMessage from './router/getNewMessage';
import getProgress from './router/getProgress';
import login from './router/login';
import sendSms from './router/sendSms';
import getContact from './router/getContact';

function router(
	SseSuscriber: Map<string, Array<(message: InstanceType<typeof Message>) => void>>,
	smsSender: SmsSender
) {
	const route = Router();

	route.post('/login', login);
	route.post('/getMessage', getMessage);
	route.post('/createContact', createContact);
	route.get('/getProgress', getProgress);
	route.post('/getNewMessage', (req, res) => getNewMessage(req, res, SseSuscriber));
	route.post('/sendSms', (req, res) => sendSms(req, res, smsSender));
	route.post('/getContact', getContact);

	return route;
}

export default router;
