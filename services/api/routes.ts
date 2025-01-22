import { Router } from 'express';
import getMessage from './router/getMessage';
import getProgress from './router/getProgress';
import login from './router/login';
import getNewMessage from './router/getNewMessage';
import mongoose from 'mongoose';
import { SmsSender } from '../../tools/sendSms';
import sendSms from './router/sendSms';
import createContact from './router/createContact';

function router(SseSuscriber: Map<string, Array<(message: string) => void>>, smsSender: SmsSender) {
	const route = Router();

	route.post('/login', login);
	route.post('/getMessage', getMessage);
	route.post('/createContact', createContact);
	route.get('/getProgress', getProgress);
	route.post('/getNewMessage', (req, res) => getNewMessage(req, res, SseSuscriber));
	route.post('/sendSms', (req, res) => sendSms(req, res, smsSender));

	return route;
}

export default router;
