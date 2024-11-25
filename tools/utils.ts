import { User } from '../models/user.model';
import ServicesClass from '../services/service';
import { Contact } from '../models/contact.model';
import path from 'path';
import fs from 'node:fs';
import { log } from './log';
import mongoose from 'mongoose';
import { Response } from 'express';

/**
 * Get contact by phone number
 * @warning This function dont log anything
 */
async function getContact(phoneNumber: string): Promise<InstanceType<typeof Contact> | undefined> {
	const contact = await Contact.findOne({ phoneNumber: { $eq: phoneNumber } });
	if (!contact) {
		return;
	}
	return contact;
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

async function createContact(phoneNumber: string): Promise<InstanceType<typeof Contact> | undefined> {
	const contact = await Contact.create({
		phoneNumber
	});
	if (!contact) {
		log('error in creating client', 'WARNING', __filename);
		return;
	}
	return contact;
}

async function createUser(phoneNumber: string): Promise<InstanceType<typeof User> | undefined> {
	const user = await User.create({
		phoneNumber
	});
	if (!user) {
		log('error in creating client', 'WARNING', __filename);
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

export { getContact, getUser, loadServices, createContact, createUser, getOrCreateContact, checkParameters };
