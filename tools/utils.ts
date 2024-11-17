import { User } from '../models/user';
import ServicesClass from '../services/service';
import { Contact } from '../models/contact';
import path from 'path';
import fs from 'node:fs';
import { log } from './log';

/**
 * Get user by phone number
 * @warning This function dont log anything
 */
async function getContact(phoneNumber: string): Promise<InstanceType<typeof Contact> | undefined> {
	const contact = await Contact.findOne({ phoneNumber: { $eq: phoneNumber } });
	if (!contact) {
		return;
	}
	return contact;
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

export { getContact, loadServices, createContact };
