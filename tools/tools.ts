import { User } from '../models/user.model';
import ServicesClass from '../services/service';
import { Contact } from '../models/contact.model';
import path from 'path';
import fs from 'node:fs';
import { log } from './log';
import mongoose from 'mongoose';
import { Response } from 'express';
/**
 * Converts the input text to a bold Unicode variant.
 *
 * This function takes a string and transforms each character into its bold Unicode equivalent,
 * if such an equivalent exists. It supports bold transformation for lowercase letters (a-z),
 * uppercase letters (A-Z), and digits (0-9). Characters outside these ranges are not transformed.
 *
 * @param text - The input string to be transformed.
 * @returns The transformed string with bold Unicode characters.
 */
function bolderize(text: string) {
	return text
		.split('')
		.map(char => {
			const code = char.codePointAt(0);

			if (typeof code == 'undefined') return char;

			if (code >= 97 && code <= 122) {
				// a-z
				return String.fromCodePoint(code + 120_205);
			} else if (code >= 65 && code <= 90) {
				// A-Z
				return String.fromCodePoint(code + 120_211);
			} else if (code >= 48 && code <= 57) {
				//0-9
				return String.fromCodePoint(code + 120_764);
			}
			return char;
		})
		.join('');
}

function IsPhoneNumber(number: any) {
	if (typeof number != 'string') return false;
	if (!number.match(/^(?:\+33|0)\s*[1-9](?:\s*\d{2}){4}$/)) return false;

	return true;
}

function getFileName(filename: string) {
	return filename?.split('\\')?.at(-1)?.split('/')?.at(-1) ?? 'error';
}

function clearPhone(phoneNumber: string): string {
	if (typeof phoneNumber != 'string') return '';
	phoneNumber = phoneNumber.trim();

	phoneNumber = phoneNumber.replaceAll(' ', '');
	phoneNumber = phoneNumber.replaceAll('.', '');
	phoneNumber = phoneNumber.replaceAll('-', '');
	phoneNumber = phoneNumber.replaceAll('o', '0');
	phoneNumber = phoneNumber.replaceAll('(', '');
	phoneNumber = phoneNumber.replaceAll(')', '');
	phoneNumber = phoneNumber.replaceAll('+33', '33');

	if (phoneNumber.startsWith('6') || phoneNumber.startsWith('7')) {
		phoneNumber = '0' + phoneNumber;
	}
	if (phoneNumber.startsWith('33') && phoneNumber.length == 11) {
		phoneNumber = '0' + phoneNumber.slice(2);
	}
	if (phoneNumber.length == 12 && phoneNumber.startsWith('06')) {
		phoneNumber = '+336' + phoneNumber.slice(2);
	}
	if (phoneNumber.startsWith('0')) {
		phoneNumber = phoneNumber.replace('0', '+33');
	}
	return phoneNumber;
}

function phoneNumberCheck(phone: string): boolean {
	// console.log(phone);
	if (typeof phone != 'string') return false;
	if (!phone.startsWith('+')) return false;

	const phoneArray = phone.split('');
	// console.log(phone.length);
	if (phone.length % 2 == 0) {
		phoneArray.splice(0, 3);
	} else {
		phoneArray.splice(0, 4);
	}
	// console.log(phone);
	phone = phoneArray.join('');
	if (phone.match(/^[0-9]{9}$/)) return true;
	return false;
}

/**
 * Get user by phone number
 * @warning This function dont log anything
 */
async function getUser(phoneNumber: string): Promise<InstanceType<typeof User> | undefined> {
	const user = await User.findOne({ phoneNumber: { $eq: phoneNumber } });
	if (!user) {
		return;
	}
	return user;
}

async function loadServices(): Promise<Array<ServicesClass>> {
	const services: Array<ServicesClass> = [];
	const servicesDir = path.resolve(__dirname, '../services');

	try {
		//getting all subDirectory of servicesDir
		const serviceDirs = await fs.promises.readdir(servicesDir, { withFileTypes: true });
		const dirs = serviceDirs.filter(dir => dir.isDirectory());
		// charge all services
		for (const dir of dirs) {
			const servicePath = path.join(servicesDir, dir.name, dir.name + '.ts');
			try {
				const module = await import(servicePath);

				if (module.default) {
					services.push(new module.default());
				} else {
					log(`no class found on ${dir.name}`, 'ERROR', __filename);
				}
			} catch (error) {
				log(`error on import of ${dir.name}`, 'ERROR', __filename);
			}
		}
	} catch (error) {
		log(`error on reading services`, 'CRITICAL', __filename, { error });
	}
	return services;
}

/**
 * Get contact by phone number
 * @warning This function dont log anything
 */
async function getContact(phoneNumber: string): Promise<InstanceType<typeof Contact> | undefined> {
	const contact = await Contact.findOne({ phoneNumber: { $eq: clearPhone(phoneNumber) } });
	if (!contact) {
		return;
	}
	return contact;
}
async function createContact(phoneNumber: string): Promise<InstanceType<typeof Contact> | undefined> {
	const contact = await Contact.create({
		phoneNumber: clearPhone(phoneNumber)
	});
	if (!contact) {
		log('error in creating client', 'WARNING', __filename);
		return;
	}
	return contact;
}

async function createUser(phoneNumber: string): Promise<InstanceType<typeof User> | undefined> {
	const user = await User.create({
		phoneNumber: clearPhone(phoneNumber)
	});
	if (!user) {
		log('error in creating user', 'WARNING', __filename);
		return;
	}
	return user;
}

async function getOrCreateContact(phoneNumber: string): Promise<InstanceType<typeof Contact> | undefined> {
	let contact = await getContact(phoneNumber);
	if (!contact) contact = await createContact(phoneNumber);
	return contact;
}

/**
 * Check if the parameters are in the body
 * @param body
 * @param res
 * @param parameters - Array of [string, any, bolean?] where the first string is the name of the parameter and the second is the type of the parameter, the third is optional and is a boolean to check if the parameter is optional
 * @param orgin
 * @returns boolean - true if all parameters are in the body
 *
 * @throws 400 - Missing parameters body is empty
 * @throws 400 - Missing parameters ( first parameter missing)
 */
function checkParameters(
	body: any,
	res: Response<any>,
	parameters: Array<
		[
			string,
			'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'ObjectId',
			// | 'array' dont work with array
			boolean?
		]
	>,
	orgin: string
): boolean {
	const ip = res.req.hostname;
	if (parameters.length == 0) return true;
	if (!body || Object.keys(body).length == 0) {
		res.status(400).send({ message: 'Missing parameters body is empty', OK: false });
		log(`Missing parameters body is empty from ` + ip, 'WARNING', orgin);
		return false;
	}
	for (let parameter of parameters) {
		if (parameter[2] && !body[parameter[0]]) {
			continue;
		}

		if (body[parameter[0]] == undefined) {
			res.status(400).send({ message: `Missing parameters (${parameter.join(':')})`, OK: false });
			log(`Missing parameters (${parameter.join(':')}) from ` + ip, 'WARNING', orgin);
			return false;
		}

		const errorText = `Wrong type for parameter (${parameter[0]} is type: ${typeof body[
			parameter[0]
		]} but required type is ${parameter[1]})`;

		if (parameter[1] == 'ObjectId') {
			if (body[parameter[0]].length != 24) {
				res.status(400).send({
					message: errorText,
					OK: false
				});
				log(errorText + ` from ` + ip, 'WARNING', orgin);
				return false;
			}
			if (!mongoose.isValidObjectId(body[parameter[0]])) {
				res.status(400).send({
					message: errorText,
					OK: false
				});
				log(errorText + ` from ` + ip, 'WARNING', orgin);
				return false;
			}
		} else if (parameter[1] == 'number' && isNaN(parseInt(body[parameter[0]]))) {
			// if is nan return Missing parameters because NaN == undefined
			res.status(400).send({
				message: errorText,
				OK: false
			});
			log(errorText + ` from ` + ip, 'WARNING', orgin);
			return false;
			// } else if (parameter[1] == 'array' && !Array.isArray(body[parameter[0]])) {
			// 	res.status(400).send({
			// 		message: errorText,
			// 		OK: false
			// 	});
			// 	log(errorText + ` from ` + ip, 'WARNING', orgin);
			// 	return false;
		} else if (typeof body[parameter[0]] != parameter[1]) {
			res.status(400).send({
				message: errorText,
				OK: false
			});
			log(errorText + ` from ` + ip, 'WARNING', orgin);
			return false;
		}
	}
	return true;
}
export {
	bolderize,
	clearPhone,
	getFileName,
	IsPhoneNumber,
	phoneNumberCheck,
	getContact,
	getUser,
	loadServices,
	createContact,
	createUser,
	getOrCreateContact,
	checkParameters
};
