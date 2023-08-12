import { getAdminByPhoneNumber, getUserByPhoneNumber, isAdminPhoneNumber, isUserPhoneNumber } from "./Utils";
import admin from "./class/admin";
import sms from "./class/smsSender";
import user from "./class/user";

export default function command(message: string, phoneNumber: string, smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	message.trim();
	const command = message.split(' ');
	if (isAdminPhoneNumber(adminArray, phoneNumber)) {
		if (command[0] == 'ban') {
			banUser(phoneNumber, command, smsAPI, adminArray, userArray);
		} else if (command[0] == 'unban') {
			unbanUser(phoneNumber, command, smsAPI, adminArray, userArray);
		}
	} else if (isUserPhoneNumber(userArray, phoneNumber)) {

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
}