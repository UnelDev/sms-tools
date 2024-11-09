import chalk from 'chalk';
import { config } from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from 'https';
import { AddressInfo } from 'net';
import Switchboard from './Switchboard';
import { IsPhoneNumber } from './tools/tools';
import sendSms from './tools/sendSms';

config();
const app = express();
app.use(express.json());

const switchboard = new Switchboard();

const options = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt')
};

const server = https.createServer(options, app);

server.listen(443, () => {
	console.log('Listening on port ' + (server.address() as AddressInfo).port);
});

app.post('/', async (req, res) => {
	res.status(200).send('Hello World');
});

app.post('/sms', (req, res) => {
	res.status(200).send();
	console.log(req.body);
	if (typeof req.body.payload.message !== 'string' || typeof req.body.payload.phoneNumber !== 'string') {
		console.log('bad body');
		return;
	}

	let phoneNumber = req.body.payload.phoneNumber;
	let message: string = req.body.payload.message;
	message = message.trim();

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
