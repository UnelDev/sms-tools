import chalk from 'chalk';
import { config } from 'dotenv';
import express from 'express';

import Switchboard from './Switchboard';
import { IsPhoneNumber } from './tools/tools';
import axios from 'axios';

config();
const app = express();
app.use(express.json());

const switchboard = new Switchboard();

const server = app.listen(process.env.port, () => {
	console.log('Listening on port ' + (server.address() as any).port);
});

app.post('/', async (req, res) => {
	if (typeof req.body.message != 'string' || typeof req.body.contact != 'string') {
		console.log('bad body');
		return;
	}
	res.status(200);
	let phoneNumber = req.body.contact;
	let message: string = req.body.message;
	res.status(200);
	message.trim();

	if (phoneNumber.startsWith('+33')) {
		phoneNumber = phoneNumber.replace('+33', '0');
	}

	if (!IsPhoneNumber(phoneNumber)) {
		console.log(`[<${chalk.red(phoneNumber)}<] ${message}`);
		return;
	}
	console.log(`[<${chalk.blue(phoneNumber)}<] ${message}`);
	switchboard.main(phoneNumber, message);
});

// const url = 'http://192.168.1.200:8080/v1/sms/';
// const data = new URLSearchParams();
// data.append('phone', '0769172331');
// data.append('message', 'your message');

// axios
// 	.post(url, data)
// 	.then(response => {
// 		console.log(response);
// 	})
// 	.catch(error => {
// 		console.error(error);
// 	});
