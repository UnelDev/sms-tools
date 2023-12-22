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

		this.child.on('close', code => {
			this.started = false;
			console.log('Model closed (' + code + ')');
		});

		this.child.on('error', code => {
			this.started = false;
			console.log('Model crashed (' + code + ')');
		});

		return new Promise(resolve => {
			let buffer = '';

			this.child?.stdout.on('data', (data: Buffer) => {
				buffer += data.toString('utf-8');

				const lines = buffer.split('\n');
				buffer = lines.pop() as string;
				console.log(lines);

				if (lines.find(line => line.includes('HTTP server listening'))) {
					this.started = true;
					console.log('Model ' + this.name + ' started');
					resolve(true);
				}
			});
		});
	}

	async message(userTalk: User, message: string) {
		if (userTalk.phoneNumber != this.userTalk?.phoneNumber) {
			sendSms(userTalk.phoneNumber, 'Error: "User talk to another model"');
			return;
		}
		if (!this.started) {
			sendSms(userTalk.phoneNumber, 'Model non started, wait the message');
			return;
		}
		sendSms(userTalk.phoneNumber, (await chat_completion(message, 'http://127.0.0.1:' + this.port)) as string);
	}

	close() {
		console.log(this.name + ' closed');
		this.child?.kill('SIGABRT');
		this.userTalk?.otherInfo.set('LlamaServer_closeTimer', undefined);
		this.userTalk?.otherInfo.set('LlamaServer_modelNumber', undefined);
	}
}

export default Model;
