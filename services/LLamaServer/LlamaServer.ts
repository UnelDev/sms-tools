import fs from 'fs';

import sendSms from '../../tools/sendSms';
import { bolderize } from '../../tools/tools';
import User from '../../user/User';
import Service from '../Service';
import Model from './model';

class llamaServer extends Service {
	model: Array<Model>;
	constructor() {
		super();
		this.name = 'Llama one';
		this.model = this.loadConfog();
		if (this.model == undefined) this.model = [];
	}
	newAction(user: User, message: string) {
		if (typeof user.otherInfo.get('LlamaServer_modelNumber') == 'number') {
			this.newQuestion(user, message);
			return;
		}
		const modelNumber = parseInt(message.split(' ')[0]);
		if (!isNaN(modelNumber) && modelNumber >= 0 && modelNumber < this.model.length) {
			if (this.model[modelNumber].started) {
				sendSms(user.phoneNumber, 'This model is already used. Please try again later.');
				return;
			}
			this.modelStarting(user, modelNumber);
			return;
		}
		const modelList = this.model
			.map((value, i) => {
				return `\n${i}: ` + value.name;
			})
			.join('');
		sendSms(user.phoneNumber, `Select your model: ${modelList}\n\n${bolderize('home')}: Go to main menu`);
	}

	private newQuestion(reqUser: User, message: string) {
		this.model[reqUser.otherInfo.get('LlamaServer_modelNumber')].message(reqUser, message);
		clearTimeout(reqUser.otherInfo.get('LlamaServer_closeTimer'));
		reqUser.otherInfo.set(
			'LlamaServer_closeTimer',
			setTimeout(() => {
				this.model[reqUser.otherInfo.get('LlamaServer_modelNumber')].close();
			}, 300_000)
		);
	}

	private modelStarting(reqUser: User, modelNumber: number) {
		this.model[modelNumber].start(reqUser).then(() => this.modelStarted(reqUser, modelNumber));
		sendSms(
			reqUser.phoneNumber,
			`Model ${this.model[modelNumber].name} starting up. ${bolderize('Wait')} for a new message.`
		);
	}

	private modelStarted(reqUser: User, modelNumber: number) {
		reqUser.otherInfo.set('LlamaServer_modelNumber', modelNumber);
		reqUser.otherInfo.set(
			'LlamaServer_closeTimer',
			setTimeout(() => {
				this.model[modelNumber].close();
			}, 300_000)
		);

		sendSms(
			reqUser.phoneNumber,
			"Model started, you can talk to him. If you don't talk to him for 5 minutes the model will be closed."
		);
	}

	loadConfog() {
		const data = fs.readFileSync('services/LLamaServer/config.json');
		return (JSON.parse(data.toString()) as Array<any>).map(
			el => new Model(el.name, el.path, el.port)
		) as Array<Model>;
	}
}

export default llamaServer;
