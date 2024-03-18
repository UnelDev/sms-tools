import chalk from 'chalk';
import fs from 'fs';
function loadEnvironment() {
	try {
		let config = JSON.parse(fs.readFileSync('config.json').toString());
		if (!config) {
			config = { refuseDefault: true, authoriseNumbers: [] };
		}
		process.env.port = config.port;
		process.env.PHONE_IP = config.PHONE_IP;
		return config;
	} catch (e) {
		console.log(
			'[' +
				chalk.red('ERROR') +
				'] please create a config.json file' +
				`
port: number
PHONE_IP: string`
		);
		return { refuseDefault: true, authoriseNumbers: [] };
	}
}
export default loadEnvironment;
