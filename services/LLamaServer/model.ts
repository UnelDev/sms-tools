import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import sendSms from '../../tools/sendSms';
import User from '../../user/User';
import chat_completion from './competion';

class Model {
	name: string;
	path: string;
	child: ChildProcessWithoutNullStreams | undefined;
	started: boolean = false;
	port: number;
	userTalk: User | undefined;

	constructor(name: string, path: string, port: number) {
		this.name = name;
		this.path = path;
		this.port = port;
	}

	start(userTalk: User) {
		this.userTalk = userTalk;
		this.child = spawn(
			this.path,
			['-m', '/opt/llama.cpp/models/' + this.name + '.gguf', '-c', '2048', '--port', this.port.toString()],
			{ detached: false }
		);

		const p = new Promise(resolve => {
			let buffer = '';

			this.child?.stdout.on('data', (data: Buffer) => {
				buffer += data.toString('utf-8');

				const lines = buffer.split('\n');
				buffer = lines.pop() as string;

				lines.forEach(line => {
					if (line.includes('HTTP server listening')) {
						this.started = true;
						console.log('llama started');
						resolve(true);
					}
				});
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
		if (userTalk.phoneNumber != this.userTalk?.phoneNumber) {
			sendSms(userTalk.phoneNumber, 'Error contact Adminisrator: "user talk to another model"');
			return;
		}
		if (!this.started) {
			sendSms(userTalk.phoneNumber, 'Model non started, wait the message');
			return;
		}
		const res = chat_completion(message, 'http://127.0.0.1:' + this.port);
		sendSms(userTalk.phoneNumber, (await res) as string);
	}

	close() {
		console.log(this.name + 'close ');
		this.child?.kill('SIGABRT');
		this.userTalk?.otherInfo.set('LlamaServer_closeTimer', undefined);
		this.userTalk?.otherInfo.set('LlamaServer_modelNumber', undefined);
	}
}

export default Model;
