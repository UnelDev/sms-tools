import chalk from 'chalk';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { IsPhoneNumber, removeAll, removeEmoji } from './Utils';
import admin from './class/admin';
import llama from './class/llama';
import { restoreUsersFromFile, restoreadminFromFile } from './class/restore';
import sms from './class/smsSender';
import user from './class/user';
import command from './command';

async function main() {
	const prefix = '!';
	console.log('starting...');
	const smsAPI = new Promise<sms>((resolve, rejects) => {
		const port = isNaN(parseInt(process.env.port)) ? 3333 : parseInt(process.env.port);
		const mySms = new sms(
			port,
			'llama-sms',
			'default',
			newMessageCallback,
			process.env.serverAdress ?? 'http://localhost:3000',
			'http://localhost',
			() => resolve(mySms),
			rejects,
			() => console.log('connected to smsAPI')
		);
	}).catch(el => {
		console.log('error');
		throw el;
	});
	const llamaAPI = new Promise<llama>(resolve => {
		const l = new llama(() => resolve(l));
	});
	let userArray: Array<user> = restoreUsersFromFile();
	let adminArray: Array<admin> = restoreadminFromFile();
	let curentHistory: Array<[Date, string, string]> = [[new Date(0), '0000000000', 'started']];
	await smsAPI;
	await llamaAPI;
	console.log('Llama started!');

	async function newMessageCallback(message: string, phoneNumber: string, req: any) {
		if (typeof message != 'string' || typeof phoneNumber != 'string') {
			console.log('bad body');
			return;
		}
		message = removeAll(message, '\n');
		message = removeEmoji(message);
		message.trim();
		if (phoneNumber.startsWith('+33')) {
			phoneNumber = phoneNumber.replace('+33', '0');
		}
		if (!IsPhoneNumber(phoneNumber)) {
			console.log(
				'[' + chalk.red('ERROR') + "] '" + 'recevied message from: ' + chalk.bold(phoneNumber) + "': " + message
			);
		}
		if (message.startsWith(prefix)) {
			message = message.replace(prefix, '');
			console.log('[' + chalk.yellow('COMMAND') + "] '" + chalk.bold(phoneNumber) + "': " + message);
			command(
				message,
				phoneNumber,
				req,
				Date.now(),
				await smsAPI,
				await llamaAPI,
				adminArray,
				userArray,
				curentHistory
			);
		} else {
			ProcessMessage(phoneNumber, userArray, curentHistory, message, await smsAPI, await llamaAPI);
		}
	}
}

console.clear();
main();

function ProcessMessage(
	phoneNumber: any,
	userArray: user[],
	curentHistory: [Date, string, string][],
	message: string,
	smsAPI: sms,
	llamaAPI: llama
) {
	process.stdout.write('[' + chalk.blue('MESSAGE') + "] '" + chalk.bold(phoneNumber) + "': ");

	const targetUser = userArray.find(Element => Element.phoneNumber == phoneNumber);
	if (typeof targetUser == 'undefined') {
		targetUser == new user(phoneNumber);
	}

	if (
		curentHistory[curentHistory.length - 1][0].getTime() + 300000 < new Date().getTime() ||
		curentHistory[curentHistory.length - 1][1] == targetUser.phoneNumber ||
		message.includes('.bypass')
	) {
		targetUser.newMessage(message, smsAPI, llamaAPI, curentHistory);
	} else {
		targetUser.sendMessage(
			'Bob\'s already talking to someone. Add ".bypass" before your message to bypass this security.\n Last message sent ' +
				(new Date().getTime() - curentHistory[curentHistory.length - 1][0].getTime()) / 1000 +
				's ago.',
			smsAPI
		);
	}
}
