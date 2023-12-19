import express from 'express';
import chalk from 'chalk';
const app = express();
app.use(express.json());

import { config } from 'dotenv';
import { IsPhoneNumber } from './tools/tools';
import Switchboard from './Switchboard';
config();

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
		console.log(`[${chalk.red('ERROR')}] Received message from: ${chalk.bold(phoneNumber)}: ${message}`);
		return;
	}
	console.log(`[${chalk.blue('INFO')}] Received message from: ${chalk.bold(phoneNumber)}: ${message}`);
	switchboard.main(phoneNumber, message);
});
