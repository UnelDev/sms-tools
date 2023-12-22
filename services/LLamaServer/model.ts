import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import waitPort from 'wait-port';

import sendSms from '../../tools/sendSms';
import User from '../../user/User';
import chat_completion from './competion';
import chalk from 'chalk';

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
			console.log('[' + chalk.blue('INFO') + '] Model closed (' + code + ')');
		});

		this.child.on('error', code => {
			this.started = false;
			console.log('[' + chalk.red('ERROR') + '] Model crashed (' + code + ')');
		});

		return new Promise(resolve => {
			// Wait 30 seconds before giving up
			waitPort({ host: '127.0.0.1', port: this.port, timeout: 30_000, output: 'silent' }).then(result => {
				if (result.open) {
					console.log('[' + chalk.blue('INFO') + '] Model ' + this.name + ' started');
					this.started = true;
					resolve(true);
				} else {
					console.log('[' + chalk.red('ERROR') + "] The model didn't start");
					resolve(false);
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
