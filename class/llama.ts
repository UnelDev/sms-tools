import chalk from 'chalk';
import { spawn } from 'child_process';

export default class llama {
	message: string;
	private childProcess: import('child_process').ChildProcessWithoutNullStreams;
	private computing: boolean;
	private request: Array<[string, (response: string) => void]>;
	started: boolean;
	private onStart: Function;
	private lastData: NodeJS.Timeout | undefined;

	constructor(onStart: Function) {
		this.computing = false;
		this.request = [];
		this.message = '';
		this.started = false;
		this.childProcess = spawn(
			`${process.env.LLAMA_PATH}main -m ${process.env.LLAMA_PATH}models/${process.env.MODEL_PLACMENT} -c 512 -b 1024 -n 256 --keep 48 --repeat-penalty 1.0 -i -r "User:" -f ${process.env.LLAMA_PATH}prompts/chat-with-bob.txt`,
			{
				shell: true
			}
		);
		this.childProcess.on('error', error => {
			console.error('[' + chalk.red('model error') + ']: ' + error);
		});
		this.childProcess.on('close', code => {
			console.log('[' + chalk.red('model error') + '] llama close with code:' + code);
		});
		this.onStart = onStart;

		const outputStream = this.childProcess.stdout;
		outputStream.on('data', data => {
			this.answer(data);
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
		this.childProcess = spawn(
			`${process.env.LLAMA_PATH}main --log-disable -m ${process.env.LLAMA_PATH}models/${process.env.MODEL_PLACMENT} -c 512 -b 1024 -n 256 --keep 48 --repeat-penalty 1.0 -i -r "User:" -f ${process.env.LLAMA_PATH}prompts/chat-with-bob.txt`,
			{
				shell: true
			}
		);
		this.childProcess.on('error', error => {
			console.error('[' + chalk.red('model error') + ']: ' + error);
		});
		this.childProcess.on('close', code => {
			console.log('[' + chalk.red('model error') + '] llama close with code:' + code);
		});

		const outputStream = this.childProcess.stdout;
		outputStream.on('data', data => {
			this.answer(data);
		});
		this.onStart = onStart;
		this.started = false;
		this.send('Please tell me the largest city in Europe.', () => null);
	}

	private compute() {
		if (this.computing || this.request.length == 0) return;
		this.computing = true;
		this.childProcess.stdin.write(this.request[0][0] + '\n');
		this.childProcess.stdin.write('');
	}

	private answerThrow() {
		this.message = this.message + '\nUser:';
		this.answerResolve();
	}

	private answerResolve() {
		const ArrayOfMessage = this.message.split('\n');
		if (ArrayOfMessage.length < 2) {
			console.log('error in lenght of arrayMessage');
		}
		const readeableMessage = ArrayOfMessage[ArrayOfMessage.length - 2]
			.replace('User:Bob: ', '')
			.replace('Bob:', '')
			.replace('User:', '');
		this.request[0][1](readeableMessage);
		this.request.shift();
		if (this.request.length == 0) this.computing = false;
		if (typeof this.lastData != undefined) clearTimeout(this.lastData);
		this.compute();
	}

	private answer(data: any) {
		this.message += data.toString();
		const ArrayOfMessage = this.message.split('\n');
		if (!this.started) {
			if (ArrayOfMessage.length >= 7 && (ArrayOfMessage[7] ?? '').includes('User:')) {
				this.started = true;
				this.onStart();
			}
		}
		if (!this.computing) return;
		this.lastData = setTimeout(() => this.answerThrow.bind(this), 5_000);
		if (this.message.endsWith('User:')) this.answerResolve();
	}
}
