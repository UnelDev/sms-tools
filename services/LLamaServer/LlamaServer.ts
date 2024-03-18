import fs from 'fs';

import sendSms from '../../tools/sendSms';
import { bolderize } from '../../tools/tools';
import User from '../../user/User';
import Service from '../Service';
import Model from './model';

class llamaServer extends Service {
	models: Array<Model>;
	constructor() {
		super();
		this.name = 'Llama one';
		this.models = this.loadConfig() ?? [];
	}
	newAction(user: User, message: string) {
		if (typeof user.otherInfo.get('LlamaServer_modelNumber') == 'number') {
			this.newQuestion(user, message);
			return;
		}
		const modelNumber = parseInt(message.split(' ')[0]);
		if (!isNaN(modelNumber) && modelNumber >= 0 && modelNumber < this.models.length) {
			if (this.models[modelNumber].started) {
				sendSms(user.phoneNumber, 'This model is already used. Please try again later.');
				return;
			}
			this.startModel(user, modelNumber);
			return;
		}
		const modelList = this.models
			.map((value, i) => {
				return `\n${i}: ` + value.name;
			})
			.join('');
		sendSms(user.phoneNumber, `Select your model:${modelList}\n\n${bolderize('home')}: Go to main menu`);
		// sendSms(user.phoneNumber, `Select your model: ${modelList}\n\n${bolderize('home')}: Go to main menu`);
	}

	private newQuestion(reqUser: User, message: string) {
		this.models[reqUser.otherInfo.get('LlamaServer_modelNumber')].message(reqUser, message);
		clearTimeout(reqUser.otherInfo.get('LlamaServer_closeTimer'));
		reqUser.otherInfo.set(
			'LlamaServer_closeTimer',
			setTimeout(() => {
				this.models[reqUser.otherInfo.get('LlamaServer_modelNumber')].close();
			}, 300_000)
		);
	}

	private startModel(reqUser: User, modelNumber: number) {
		sendSms(
			reqUser.phoneNumber,
			`Model ${this.models[modelNumber].name} starting up. ${bolderize('Wait')} for a new message.`
		);
		this.models[modelNumber].start(reqUser).then(state => {
			if (!state) {
				sendSms(reqUser.phoneNumber, "An error occured, the model didn't start.");
				return;
			}
			reqUser.otherInfo.set('LlamaServer_modelNumber', modelNumber);
			reqUser.otherInfo.set(
				'LlamaServer_closeTimer',
				setTimeout(() => {
					this.models[modelNumber].close();
				}, 300_000)
			);

			sendSms(
				reqUser.phoneNumber,
				'Model started, you can talk to him. After 5 mins of inactivity, the model will be closed.'
			);
		});
	}

	private loadConfig() {
		try {
			const data = JSON.parse(fs.readFileSync('services/LLamaServer/config.json').toString()) as Array<any>;
			return data.map(el => new Model(el.name, el.path, el.port)) as Array<Model>;
		} catch (e) {
			return [];
		}
	}
}

export default llamaServer;
