import { Router } from 'express';
import getMessage from './router/getMessage';
import getProgress from './router/getProgress';
import login from './router/login';
import getNewMessage from './router/getNewMessage';
import mongoose from 'mongoose';

// Le routeur prend désormais SseSuscriber en paramètre
function router(SseSuscriber: Map<string, Array<(message: string) => void>>) {
	const route = Router();

	route.post('/login', login);
	route.post('/getMessage', getMessage);
	route.get('/getProgress', getProgress);
	route.post('/getNewMessage', (req, res) => getNewMessage(req, res, SseSuscriber));

	return route;
}

export default router;
