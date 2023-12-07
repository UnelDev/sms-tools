import chalk from 'chalk';

import { getAdminByPhoneNumber, getUserByPhoneNumber, isAdminPhoneNumber, isUserPhoneNumber, removeAll } from './Utils';
import admin from './class/admin';
import llama from './class/llama';
import user from './class/user';
import sendSms from './class/smsSender';

export default function command(
	message: string,
	phoneNumber: string,
	req: any,
	internal: number,
	llamaAPI: llama,
	adminArray: Array<admin>,
	userArray: Array<user>,
	curentHistory: Array<[Date, string, string]>
) {
	const command = message.split(' ');
	let responding = false;
	if (isAdminPhoneNumber(adminArray, phoneNumber)) {
		if (command[0] == 'ban') {
			banUser(phoneNumber, command, adminArray, userArray);
			responding = true;
		} else if (command[0] == 'unban') {
			unbanUser(phoneNumber, command, adminArray, userArray);
			responding = true;
		} else if (command[0] == 'restart') {
			restart(phoneNumber, llamaAPI);
			responding = true;
		} else if (command[0] == 'history') {
			let sendCurentHistory = curentHistory.map((Element, i) => {
				if (i % 2) return `at ${Element[0].toLocaleString()} from ${Element[1]}: ${Element[2]}`;
				return `at ${Element[0].toLocaleString()} from Bob: ${Element[2]}`;
			});
			adminArray.find(el => el.phoneNumber == phoneNumber).sendMessage(sendCurentHistory.join('\n'));
			responding = true;
		}
	}

	if (isUserPhoneNumber(userArray, phoneNumber)) {
		if (command[0] == 'ping') {
			ping(phoneNumber, req, internal, llamaAPI, adminArray, userArray);
			responding = true;
		} else if (command[0] == 'pingprog') {
			pingProg(phoneNumber, req, internal, adminArray, userArray);
			responding = true;
		}
	}
	if (!responding) {
		commandNotFond(phoneNumber, adminArray, userArray);
	}
}

function commandNotFond(phoneNumber: string, adminArray: Array<admin>, userArray: Array<user>) {
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	if (typeof admin != 'undefined') {
		admin.sendMessage('Unknown command');
	} else {
		const user = getUserByPhoneNumber(userArray, command[1]);
		if (typeof user != 'undefined') {
			user.sendMessage('Unknown command');
		} else {
			sendSms(phoneNumber, 'Unknown command');
		}
	}
}

function banUser(
	phoneNumber: string,
	command: string[],

	adminArray: Array<admin>,
	userArray: Array<user>
) {
	if (command.length != 3 && command.length != 2) {
		sendSms(phoneNumber, 'Syntax: ban <number> [duration]');
		return;
	}
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	if (typeof admin == 'undefined') {
		sendSms(phoneNumber, 'Error in finding admin');
		return;
	}
	if (!isUserPhoneNumber(userArray, command[1])) {
		admin.sendMessage('No link between a user and this phone number');
		return;
	}
	admin.actionHistory.push([new Date(), command.join(' ')]);
	admin.save();
	const user = getUserByPhoneNumber(userArray, command[1]);
	if (command.length == 3 && isNaN(parseInt(command[2]))) {
		sendSms(phoneNumber, 'Duration is not a number, syntax: ban <number> [duration]');
		return;
	}
	user.isBan = new Date(command[2] ? Date.now() + parseInt(command[2]) * 1000 : 8640000000000000);
	user.save();
	user.sendMessage(
		'You have been baned by an administrator until ' + user.isBan.toLocaleString('fr-FR', { timeZone: 'UTC' })
	);
	admin.sendMessage('User ' + user.phoneNumber + ' has be banned');
	console.log('[' + chalk.green('Success command') + '] User ' + user.phoneNumber + ' has be banned');
}

function unbanUser(
	phoneNumber: string,
	command: string[],

	adminArray: Array<admin>,
	userArray: Array<user>
) {
	if (command.length != 2) {
		sendSms(phoneNumber, 'Syntax: unban <number>');
		return;
	}
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	if (typeof admin == 'undefined') {
		sendSms(phoneNumber, 'Error in finding admin');
		return;
	}
	if (!isUserPhoneNumber(userArray, command[1])) {
		admin.sendMessage('No link between a user and this phone number');
		return;
	}
	admin.actionHistory.push([new Date(), command.join(' ')]);
	admin.save();
	const user = getUserByPhoneNumber(userArray, command[1]);
	user.isBan = new Date(0);
	user.save();
	user.sendMessage('You have been unbanned by an administrator');
	admin.sendMessage('User ' + user.phoneNumber + ' has be unbanned');
	console.log('[' + chalk.green('Success command') + '] User' + user.phoneNumber + ' has be unbanned');
}

function ping(
	phoneNumber: string,
	req: any,
	internal: number,
	llamaAPI: llama,

	adminArray: Array<admin>,
	userArray: Array<user>
) {
	const start = Date.now();
	new Promise(resolve => {
		llamaAPI.send("What's your name?", resolve);
	}).then(() => {
		const pingMessage = `ping:
sms[${req.body.pingSms.replace('.0', '')}s]
internal loop[${Date.now() - internal - (Date.now() - start)}ms]
llama[${((Date.now() - start) / 1000).toFixed(1)}s]
total = ${parseInt(req.body.pingSms.replace('.0', '')) + parseFloat(((Date.now() - start) / 1000).toFixed(1))} s.`;
		const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
		if (typeof admin != 'undefined') {
			admin.sendMessage(pingMessage);
		} else {
			const user = getUserByPhoneNumber(userArray, phoneNumber);
			if (typeof user != 'undefined') {
				const user = getUserByPhoneNumber(userArray, phoneNumber);
				if (user) {
					user.sendMessage(pingMessage);
				} else {
					console.log('[' + chalk.red('Error') + '] No user found : ' + phoneNumber);
				}
			} else {
				sendSms(phoneNumber, pingMessage);
			}
		}
		console.log(`[${chalk.green('Success command')}] ` + removeAll(pingMessage, '\n', ' '));
	});
}

function pingProg(
	phoneNumber: string,
	req: any,
	internal: number,

	adminArray: Array<admin>,
	userArray: Array<user>
) {
	const admin = getAdminByPhoneNumber(adminArray, phoneNumber);
	const pingMessage = `ping:
internal ping [${Date.now() - internal}ms]`;
	if (typeof admin != 'undefined') {
		admin.sendMessage(pingMessage);
	} else {
		const user = getUserByPhoneNumber(userArray, phoneNumber);
		if (typeof user != 'undefined') {
			const user = getUserByPhoneNumber(userArray, phoneNumber);
			if (user) {
				user.sendMessage(pingMessage);
			} else {
				console.log('[' + chalk.red('Error') + '] No user found : ' + phoneNumber);
			}
		} else {
			sendSms(phoneNumber, pingMessage);
		}
	}
	console.log(`[${chalk.green('Success command')}] ` + removeAll(pingMessage, '\n', ' '));
}

function restart(phoneNumber: string, llamaAPI: llama) {
	console.log('[' + chalk.green('Success command') + '] Restarting system...');
	sendSms(phoneNumber, 'Restarting system...');
	llamaAPI.restart(() => {
		sendSms(phoneNumber, 'restart completed');
		console.log('[' + chalk.green('Success command') + '] System restarted!');
	});
}
