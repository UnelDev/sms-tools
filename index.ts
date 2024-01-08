import chalk from 'chalk';
import { config } from 'dotenv';
import express from 'express';

import { AddressInfo } from 'net';
import Switchboard from './Switchboard';
import { IsPhoneNumber } from './tools/tools';

config();
const app = express();
app.use(express.json());

const switchboard = new Switchboard();

const server = app.listen(process.env.port, () => {
	console.log('Listening on port ' + (server.address() as AddressInfo).port);
});

app.post('/', async (req, res) => {
	console.log(req);
	res.status(200);
	if (typeof req.body.text != 'string' || typeof req.body.from != 'string') {
		console.log('bad body');
		return;
	}
	let phoneNumber = req.body.from;
	let message: string = req.body.text;
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
