import sendSms from '../tools/sendSms';
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
		if (message.trim().toLocaleLowerCase() == 'z') {
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date(date.setHours(date.getHours() + 2));
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
}

export default Tickets;
