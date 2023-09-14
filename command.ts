import chalk from "chalk";
import { getAdminByPhoneNumber, getUserByPhoneNumber, isAdminPhoneNumber, isUserPhoneNumber, removeEmoji } from "./Utils";
import admin from "./class/admin";
import llama from "./class/llama";
import sms from "./class/smsSender";
import user from "./class/user";

export default function command(message: string, phoneNumber: string, req: any, smsAPI: sms, llamaAPI: llama, adminArray: Array<admin>, userArray: Array<user>) {
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
		}
	}

	if (isUserPhoneNumber(userArray, phoneNumber)) {
		if (command[0] == 'ping') {
			ping(phoneNumber, req, llamaAPI, smsAPI, adminArray, userArray);
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
	} else if (typeof user != "undefined") {
		const user = getUserByPhoneNumber(userArray, command[1]);
		user.sendMessage('Unknown command', smsAPI);
	} else {
		smsAPI.sendSms(phoneNumber, 'Unknown command');
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
	user.banished = new Date(command[2] ? Date.now() + (parseInt(command[2]) * 1000) : 8640000000000000);
	user.save();
	user.sendMessage("You have been baned by an administrator until " + user.banished.toLocaleString('fr-FR', { timeZone: 'UTC' }), smsAPI);
	admin.sendMessage("User " + user.phoneNumber + " has be banish", smsAPI);
	console.log('[' + chalk.green('sucess command') + '] User ' + user.phoneNumber + " has be banish");
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
	user.banished = new Date(0);
	user.save();
	user.sendMessage("You have been unbaned by an administrator", smsAPI);
	admin.sendMessage("User " + user.phoneNumber + " has be unbanish", smsAPI);
	console.log('[' + chalk.green('sucess command') + '] User' + user.phoneNumber + " has be unbanish");
}

function ping(phoneNumber: string, req: any, llamaAPI: llama, smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	const start = Date.now();
	new Promise(resolve => {
		llamaAPI.send('What\'s your name?', resolve);
	}).then(() => {
		const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
		if (typeof admin != "undefined") {
			admin.sendMessage('The model respond in ' + ((Date.now() - start) / 1000).toFixed(1) + `s.
the SMS ping (from sending to receiving) is of `+ req.body.pingSms.replace('.0', '') + `s.
Total: `+ (parseInt(req.body.pingSms.replace('.0', '')) + parseFloat(((Date.now() - start) / 1000).toFixed(1))) + 's.', smsAPI);
		} else if (typeof user != "undefined") {
			const user = getUserByPhoneNumber(userArray, phoneNumber);
			if (user) {
				user.sendMessage('The model respond in ' + ((Date.now() - start) / 1000).toFixed(1) + `s.
the SMS ping (from sending to receiving) is of `+ req.body.pingSms.replace('.0', '') + `s.
Total: `+ (parseInt(req.body.pingSms.replace('.0', '')) + parseFloat(((Date.now() - start) / 1000).toFixed(1))) + 's.', smsAPI);
			} else {
				console.log('[' + chalk.red('Error') + '] no user found : ' + phoneNumber);
			}
		} else {
			smsAPI.sendSms(phoneNumber, 'The model respond in ' + ((Date.now() - start) / 1000).toFixed(1) + 's');
		}
		console.log('[' + chalk.green('sucess command') + '] ping : sms [' + req.body.pingSms.replace('.0', '') + 's] llama [' + ((Date.now() - start) / 1000).toFixed(1) + 's] total = ' + (parseInt(req.body.pingSms.replace('.0', '')) + parseFloat(((Date.now() - start) / 1000).toFixed(1))) + 's.');
	});
}

function restart(phoneNumber: string, llamaAPI: llama, smsAPI: sms) {
	console.log('[' + chalk.green('sucess command') + '] Restarting system...');
	smsAPI.sendSms(phoneNumber, 'Restarting system...');
	llamaAPI.restart(() => smsAPI.sendSms(phoneNumber, 'restart completed'));
}