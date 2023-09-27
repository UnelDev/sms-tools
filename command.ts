import chalk from "chalk";
import { getAdminByPhoneNumber, getUserByPhoneNumber, isAdminPhoneNumber, isUserPhoneNumber, removeAll } from "./Utils";
import admin from "./class/admin";
import llama from "./class/llama";
import sms from "./class/smsSender";
import user from "./class/user";

export default function command(message: string, phoneNumber: string, req: any, internal: number, smsAPI: sms, llamaAPI: llama, adminArray: Array<admin>, userArray: Array<user>, curentHistory:Array<[Date, string, string]> ) {
	const command = message.split(' ');
	let responding = false;
	if (isAdminPhoneNumber(adminArray, phoneNumber)) {
		if (command[0] == 'ban') {
			banUser(phoneNumber, command, smsAPI, adminArray, userArray);
			responding = true;
		} else if (command[0] == 'unban') {
			unbanUser(phoneNumber, command, smsAPI, adminArray, userArray);
			responding = true;
		} else if (command[0] == 'restart') {
			restart(phoneNumber, llamaAPI, smsAPI);
			responding = true;
		} else if (command[0] == 'history'){
			let sendCurentHistory = curentHistory.map(Element=>{
				return(`at ${Element[0].toLocaleString()} from ${Element[1]}: ${Element[2]}`);
			})
			adminArray.find(el=>el.phoneNumber == phoneNumber).sendMessage(sendCurentHistory.join('\n'), smsAPI);
			responding = true;
		}
	}

	if (isUserPhoneNumber(userArray, phoneNumber)) {
		if (command[0] == 'ping') {
			ping(phoneNumber, req, internal, llamaAPI, smsAPI, adminArray, userArray);
			responding = true;
		} else if (command[0] == 'pingprog') {
			pingProg(phoneNumber, req, internal, smsAPI, adminArray, userArray);
			responding = true;
		}
	}
	if (!responding) {
		commandNotFond(phoneNumber, smsAPI, adminArray, userArray);
	}
}

function commandNotFond(phoneNumber: string, smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	if (typeof admin != "undefined") {
		admin.sendMessage('Unknown command', smsAPI);
	} else {
		const user = getUserByPhoneNumber(userArray, command[1]);
		if (typeof user != "undefined") {
			user.sendMessage('Unknown command', smsAPI);
		} else {
			smsAPI.sendSms(phoneNumber, 'Unknown command');
		}
	}
}

function banUser(phoneNumber: string, command: string[], smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	if (command.length != 3 && command.length != 2) {
		smsAPI.sendSms(phoneNumber, 'Syntax: ban <number> [duration]');
		return;
	}
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	if (typeof admin == "undefined") {
		smsAPI.sendSms(phoneNumber, "Error in finding admin");
		return;
	}
	if (!isUserPhoneNumber(userArray, command[1])) {
		admin.sendMessage('No link between a user and this phone number', smsAPI);
		return;
	}
	admin.actionHistory.push([new Date(), command.join(' ')]);
	admin.save();
	const user = getUserByPhoneNumber(userArray, command[1]);
	if (command.length == 3 && isNaN(parseInt(command[2]))) {
		smsAPI.sendSms(phoneNumber, 'Duration is not a number, syntax: ban <number> [duration]');
		return;
	}
	user.isBan = new Date(command[2] ? Date.now() + (parseInt(command[2]) * 1000) : 8640000000000000);
	user.save();
	user.sendMessage("You have been baned by an administrator until " + user.isBan.toLocaleString('fr-FR', { timeZone: 'UTC' }), smsAPI);
	admin.sendMessage("User " + user.phoneNumber + " has be banish", smsAPI);
	console.log('[' + chalk.green('success command') + '] User ' + user.phoneNumber + " has be banish");
}

function unbanUser(phoneNumber: string, command: string[], smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	if (command.length != 2) {
		smsAPI.sendSms(phoneNumber, 'Syntax: unban <number>');
		return;
	}
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	if (typeof admin == "undefined") {
		smsAPI.sendSms(phoneNumber, "Error in finding admin");
		return;
	}
	if (!isUserPhoneNumber(userArray, command[1])) {
		admin.sendMessage('No link between a user and this phone number', smsAPI);
		return;
	}
	admin.actionHistory.push([new Date(), command.join(' ')]);
	admin.save();
	const user = getUserByPhoneNumber(userArray, command[1]);
	user.isBan = new Date(0);
	user.save();
	user.sendMessage("You have been unbaned by an administrator", smsAPI);
	admin.sendMessage("User " + user.phoneNumber + " has be unbanish", smsAPI);
	console.log('[' + chalk.green('success command') + '] User' + user.phoneNumber + " has be unbanish");
}

function ping(phoneNumber: string, req: any, internal: number, llamaAPI: llama, smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	const start = Date.now();
	new Promise(resolve => {
		llamaAPI.send('What\'s your name?', resolve);
	}).then(() => {
		const pingMessage = `ping:
sms[${req.body.pingSms.replace('.0', '')}s]
internal loop[${(Date.now() - internal) - (Date.now() - start)}ms]
llama[${((Date.now() - start) / 1000).toFixed(1)}s]
total = ${(parseInt(req.body.pingSms.replace('.0', '')) + parseFloat(((Date.now() - start) / 1000).toFixed(1)))} s.`
		const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
		if (typeof admin != "undefined") {
			admin.sendMessage(pingMessage, smsAPI);
		} else {
			const user = getUserByPhoneNumber(userArray, phoneNumber);
			if (typeof user != "undefined") {
				const user = getUserByPhoneNumber(userArray, phoneNumber);
				if (user) {
					user.sendMessage(pingMessage, smsAPI);
				} else {
					console.log('[' + chalk.red('Error') + '] no user found : ' + phoneNumber);
				}
			} else {
				smsAPI.sendSms(phoneNumber, pingMessage);
			}
		}
		console.log(`[${chalk.green('success command')}] ` + removeAll(pingMessage, '\n', ' '));
	});
}

function pingProg(phoneNumber: string, req: any, internal: number, smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	const pingMessage = `ping:
internal ping [${((Date.now() - internal))}ms]`;
	if (typeof admin != "undefined") {
		admin.sendMessage(pingMessage, smsAPI);
	} else {
		const user = getUserByPhoneNumber(userArray, phoneNumber);
		if (typeof user != "undefined") {
			const user = getUserByPhoneNumber(userArray, phoneNumber);
			if (user) {
				user.sendMessage(pingMessage, smsAPI);
			} else {
				console.log('[' + chalk.red('Error') + '] no user found : ' + phoneNumber);
			}
		} else {
			smsAPI.sendSms(phoneNumber, pingMessage);
		}
	}
	console.log(`[${chalk.green('success command')}] ` + removeAll(pingMessage, '\n', ' '));
}

function restart(phoneNumber: string, llamaAPI: llama, smsAPI: sms) {
	console.log('[' + chalk.green('success command') + '] Restarting system...');
	smsAPI.sendSms(phoneNumber, 'Restarting system...');
	llamaAPI.restart(() => {
		smsAPI.sendSms(phoneNumber, 'restart completed');
		console.log('[' + chalk.green('success command') + '] System restarted!');
	});
}