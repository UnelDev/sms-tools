import sendSms from '../tools/sendSms';
import { bolderize } from '../tools/tools';
import User from '../user/User';
import Service from './Service';

class Tickets extends Service {
	lock: boolean = false;
	conflic: Array<string> = []; // no effect if start == false
	started: boolean = false; // no effect if lock == false
	constructor() {
		super();
		this.name = 'tikect';
	}
	newAction(user: User, message: string) {
		if (message.trim().toLocaleLowerCase() == '1z') this.oneArea(user);
		else if (message.trim().toLocaleLowerCase() == '2z') this.twoArea(user);
		else if (message.trim().toLocaleLowerCase() == '3z') this.threeArea(user);
		else {
			user.sendMessage(`You have selected the ${bolderize(this.name)} service. List of command:
${bolderize('1z')} : get a ticket (1 zone, 1 hour)
${bolderize('2z')} : get a ticket (2 zones, 2 hours)
${bolderize('3z')} : get a ticket (3 zones, 2 hours)

${bolderize('home')}: Go back to the main menu`);
		}
	}

	threeArea(user: User) {
		{
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date();
			hoursEnd.setHours(hoursEnd.getHours() + 2);
			user.sendMessage(`Cars Région
Titre 3 zones

Valable 2h
${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${hoursEnd.toLocaleTimeString('fr-FR', {
				hour: '2-digit',
				minute: '2-digit'
			})}
${day}.${month}.${year}
6.90 euros

A PRÉSENTER AU CONDUCTEUR

78'52'72'38'99'34

${user.phoneNumber.replaceAll('+33', '')}S0XU
bit.ly/CGVticketSMS
			`);
		}
	}

	oneArea(user: User) {
		{
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date();
			hoursEnd.setHours(hoursEnd.getHours() + 1);
			user.sendMessage(`Cars Région
	Titre 1 zone

	Valable 1h
	${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${hoursEnd.toLocaleTimeString('fr-FR', {
				hour: '2-digit',
				minute: '2-digit'
			})}
	${day}.${month}.${year}
	3.90 euros

	A PRÉSENTER AU CONDUCTEUR

	78'52'72'38'99'34

	${user.phoneNumber.replaceAll('+33', '')}S0XU
	bit.ly/CGVticketSMS
				`);
		}
	}

	twoArea(user: User) {
		{
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date();
			hoursEnd.setHours(hoursEnd.getHours() + 2);
			user.sendMessage(`Cars Région
	Titre 2 zones

	Valable 2h
	${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${hoursEnd.toLocaleTimeString('fr-FR', {
				hour: '2-digit',
				minute: '2-digit'
			})}
	${day}.${month}.${year}
	5.40 euros

	A PRÉSENTER AU CONDUCTEUR

	78'52'72'38'99'34

	${user.phoneNumber.replaceAll('+33', '')}S0XU
	bit.ly/CGVticketSMS
				`);
		}
	}
}

export default Tickets;
