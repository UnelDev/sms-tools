import { config } from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from 'https';
import { AddressInfo } from 'net';
import { IsPhoneNumber } from './tools/tools';
import mongoose from 'mongoose';
import { log } from './tools/log';
import messageRecevied from './messageRecevied';
import sendSms from './tools/sendSms';
import { eventDelivered, eventfailed, eventSent } from './messageEvent';

config();
const app = express();
app.use(express.json());

// in test, the test script will create the connection to the database
if (process.env.JEST_WORKER_ID == undefined) {
	// Connect to MongoDB using Mongoose
	if (process.env.ISDEV == 'false') {
		mongoose
			.connect(process.env.URI ?? '')
			.then(() => {
				log('Successfully connected to MongoDB', 'DEBUG', __filename);
			})
			.catch(error => {
				log('Error connecting to MongoDB: ' + error, 'CRITICAL', __filename);
			});
	} else {
		mongoose
			.connect(process.env.BDD_URI_DEV ?? '')
			.then(async () => {
				log('Successfully connected to MongoDB', 'DEBUG', __filename);
			})
			.catch(error => {
				log('Error connecting to MongoDB: ' + error, 'CRITICAL', __filename);
			});
	}
}

const server = https.createServer(
	{
		key: fs.readFileSync('server.key'),
		cert: fs.readFileSync('server.crt')
	},
	app
);

server.listen(443, () => {
	log(`Server started on port ${(server.address() as AddressInfo).port}`, 'INFO', __filename);
});

app.post('/', async (req, res) => {
	res.status(200).send('Hello World');
	log('root page accessed', 'INFO', __filename, null, req.hostname);
});

app.post('/sms', (req, res) => {
	res.status(200).send();
	if (typeof req.body.payload.message !== 'string' || typeof req.body.payload.phoneNumber !== 'string') {
		log('Invalid request body', 'ERROR', __filename, null, req.hostname);
		return;
	}

	let phoneNumber = req.body.payload.phoneNumber;
	let message = req.body.payload.message;
	message = message.trim();

	if (phoneNumber.startsWith('+33')) {
		phoneNumber = phoneNumber.replace('+33', '0');
	}

	if (!IsPhoneNumber(phoneNumber)) {
		log('Invalid phone number', 'ERROR', __filename, null, req.hostname);
		return;
	}
	messageRecevied(message, phoneNumber, req.body.id);
});

app.post('/sent', (req, res) => {
	res.status(200).send();
	if (typeof req.body.payload.messageId !== 'string') {
		log('Invalid request body for /sent', 'ERROR', __filename, null, req.hostname);
		return;
	}
	eventSent(req.body.payload.messageId, new Date());
});

app.post('/delivered', (req, res) => {
	res.status(200).send();
	if (typeof req.body.payload.messageId !== 'string') {
		log('Invalid request body for /delivered', 'ERROR', __filename, null, req.hostname);
		return;
	}
	eventDelivered(req.body.payload.messageId, new Date());
});

app.post('/failed', (req, res) => {
	res.status(200).send();
	if (typeof req.body.payload.messageId !== 'string' || typeof req.body.payload.reason !== 'string') {
		log('Invalid request body for /failed', 'ERROR', __filename, null, req.hostname);
		return;
	}
	eventfailed(req.body.payload.messageId, new Date(), req.body.payload.reason);
});
