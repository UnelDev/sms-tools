import axios from 'axios';
import express from 'express';

class allInSmsClient {
	name: string;
	serverAdress: string;
	prefix: string;
	port: number;
	isRegister: boolean;
	expressServer: express.Application;
	newMessageCallback: Function;

	constructor(
		port: number = 3333,
		name: string,
		prefix: string | 'default',
		newMessageCallback: (message: string, phoneNumber: string, req: any) => void,
		serverAdress: string = 'http://localhost:3000',
		myAdress: string = 'http://localhost',
		sucessCallback: () => void = () => null,
		errorCallback: (err: any) => void = () => null,
		serverStartedCallback: () => void = () => null
	) {
		this.port = port;
		this.serverAdress = serverAdress;
		this.name = name;
		this.prefix = prefix;
		this.newMessageCallback = newMessageCallback;
		this.isRegister = false;
		this.expressServer = express();
		this.expressServer.use(express.json());
		this.expressServer.listen(port, () => serverStartedCallback);
		axios
			.post(this.serverAdress + '/register', {
				serviceName: this.name,
				prefix: prefix,
				callbackLink: myAdress + ':' + port
			})
			.then(response => {
				if (response.status == 200) {
					sucessCallback();
					this.isRegister = true;
				} else {
					errorCallback(response.status);
				}
			})
			.catch(err => errorCallback(err));
		express();
	}

	express() {
		this.expressServer.get('/ping', (req: any, res: any) => {
			res.send('pong');
		});
		this.expressServer.get('/newSms', (req: any) => {
			this.newMessageCallback(req.body.message ?? '', req.body.phoneNumber ?? '');
		});
	}

	/**
	 * The function sends a new message to a specified phone number using all-in-sms.
	 * @param {string} message - The message parameter is a string that represents the content of the message you want to send.
	 * It can be any text or information that you want to communicate to the recipient.
	 * @param {string} to - The "to" parameter is the phone number or recipient of the message. It specifies the destination of
	 * the message.
	 */
	sendNewMessage(message: string, to: string) {
		if (!this.isRegister) return;
		axios.post(this.serverAdress + '/send', { prefix: this.prefix, message: message, phoneNumber: to });
	}

	registerOverwrite(
		sucessCallback: Function = () => null,
		errorCallback: Function = () => null,
		prefix: string = this.prefix
	) {
		this.prefix = prefix;
		axios
			.post(this.serverAdress + '/registerOverwrite', { serviceName: this.name, prefix: prefix })
			.then(response => {
				if (response.status == 200) {
					sucessCallback();
					this.isRegister = true;
				} else {
					errorCallback();
				}
			})
			.catch(() => errorCallback);
	}
}

export default allInSmsClient;
