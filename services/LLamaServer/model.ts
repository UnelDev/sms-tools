import axios from 'axios';
import { exec, ChildProcessWithoutNullStreams } from 'child_process';
import sendSms from '../../tools/sendSms';
class Model {
	name: string;
	path: string;
	childProcess: ChildProcessWithoutNullStreams;
	started: boolean = false;
	port: number;
	constructor(name: string, path: string, port: number) {
		this.name = name;
		this.path = path;
		this.port = port;
	}
	start() {
		const mod = exec(
			this.path + ' -m /opt/llama.cpp/models/llama-7b/monadgpt.Q4_0.gguf -c 2048 --port ' + this.port.toString()
		);
		const p = new Promise(resolve => {
			mod.stdout.on('data', (data: Buffer) => {
				if (data.toString().includes('HTTP server listening')) {
					resolve(true);
					this.started = true;
				}
			});
		});

		mod.on('close', code => {
			this.started = false;
			console.log('Llama closed');
		});
		return p;
	}

	async message(phoneNumber: string, message: string) {
		if (!this.started) {
			sendSms(phoneNumber, 'Model non started, wait the message');
			return;
		}
		const res = axios.post('http://127.0.0.1:' + this.port + '/completion', { prompt: message, n_predict: 512 });
		sendSms(phoneNumber, (await res).data.content);
	}
}

export default Model;
