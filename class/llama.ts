import chalk from 'chalk';
import { spawn } from 'child_process';
export default class llama {
	message: string;
	childProcess: import("child_process").ChildProcessWithoutNullStreams;
	computing: boolean;
	request: Array<[string, (response: string) => void]>;
	link: string;
	started: boolean;
	onStart: Function;

	constructor(link: string, onStart: Function) {
		this.computing = false;
		this.request = [];
		this.message = '';
		this.link = link;
		this.started = false;
		this.childProcess = spawn('bash', [link], { shell: true });
		this.childProcess.on('error', (error) => {
			console.error('[' + chalk.red('model error') + ']: ' + error);
		});
		this.childProcess.on('close', (code) => {
			console.log('[' + chalk.red('model error') + '] llama close with code:' + code);
		});
		this.onStart = onStart;

		const outputStream = this.childProcess.stdout;
		outputStream.on('data', (data) => {
			this.awnser(data);
		});

		this.send('Please tell me the largest city in Europe.', () => null);

	}

	send(query: string, callback: (response: string) => void) {
		this.request.push([query, callback]);
		if (!this.computing) {
			this.compute();
		}
	}

	restart(onStart: Function) {
		this.message = '';
		this.computing = false;
		this.request = [];
		this.childProcess = spawn('bash', [this.link], { shell: true });
		this.childProcess.on('error', (error) => {
			console.error('[' + chalk.red('model error') + ']: ' + error);
		});
		this.childProcess.on('close', (code) => {
			console.log('[' + chalk.red('model error') + '] llama close with code:' + code);
		});

		const outputStream = this.childProcess.stdout;
		outputStream.on('data', (data) => {
			this.awnser(data);
		});
		this.onStart = onStart;
		this.started = false;
		this.send('Please tell me the largest city in Europe.', () => null);
	}

	private compute() {
		if (this.computing || this.request.length == 0) return;
		this.computing = true;
		this.childProcess.stdin.write(this.request[0][0] + "\n");
		this.childProcess.stdin.write("");
	}

	private awnser(data: any) {
		this.message += data.toString();
		if (!this.started) {
			const ArrayOfMessage = this.message.split('\n');
			if (ArrayOfMessage.length >= 7 && ArrayOfMessage[7] == 'User:') {
				this.started = true;
				this.onStart();
			}
		}
		if (!this.computing) return;
		if (this.message.endsWith('User:')) {
			const ArrayOfMessage = this.message.split('\n')
			if (ArrayOfMessage.length < 2) { console.log('error'); }
			const readeableMessage = ArrayOfMessage[ArrayOfMessage.length - 2].replace('User:Bob: ', '').replace('Bob:', '');
			this.request[0][1](readeableMessage);
			this.request.shift();
			if (this.request.length == 0) this.computing = false;
			this.compute();
		}
	}
}