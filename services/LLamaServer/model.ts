import { exec, ChildProcessWithoutNullStreams } from 'child_process';
import sendSms from '../../tools/sendSms';
import chat_completion from './competion';
import User from '../../user/User';
class Model {
	name: string;
	path: string;
	child: ChildProcessWithoutNullStreams;
	started: boolean = false;
	port: number;
	userTalk: User;
	constructor(name: string, path: string, port: number) {
		this.name = name;
		this.path = path;
		this.port = port;
	}
	start(userTalk: User) {
		this.userTalk = userTalk;
		console.log(
			this.path + ' -m /opt/llama.cpp/models/' + this.name + '.gguf -c 2048 --port ' + this.port.toString()
		);
		this.child = exec(
			this.path + ' -m /opt/llama.cpp/models/' + this.name + '.gguf -c 2048 --port ' + this.port.toString()
		);
		const p = new Promise(resolve => {
			this.child.stdout.on('data', (data: Buffer) => {
				if (data.toString().includes('HTTP server listening')) {
					resolve(true);
					this.started = true;
				}
			});
		});

		this.child.on('close', code => {
			console.log(code);
			this.started = false;
			console.log('Llama closed');
		});
		return p;
	}

	async message(userTalk: User, message: string) {
		if (userTalk.phoneNumber != this.userTalk.phoneNumber) {
			sendSms(userTalk.phoneNumber, 'Error contact Adminisrator: "user talk to another model"');
			return;
		}
		if (!this.started) {
			sendSms(userTalk.phoneNumber, 'Model non started, wait the message');
			return;
		}
		const res = chat_completion(message, 'http://127.0.0.1:' + this.port);
		sendSms(userTalk.phoneNumber, await res);
	}

	close() {
		this.child.kill('SIGABRT');
		this.userTalk.otherInfo.set('LlamaServer_closeTimer', undefined);
		this.userTalk.otherInfo.set('LlamaServer_modelNumber', undefined);
	}
}

export default Model;
