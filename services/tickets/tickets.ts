import { User } from '../../models/user';
import { sendSms } from '../../tools/sendSms';
import ServicesClass from '../service';

class tickets extends ServicesClass {
	constructor() {
		super();
		this.name = 'tickets';
		this.description = 'create our tikets for transIsere bus. educative usage only';
		this.version = '1.0';
		this.type = 'command';
		this.commands = ['1z', '2z', '3z'];
		this.bypassTrigger = ['1z', '2z', '3z'];
	}
	newMessage(user: InstanceType<typeof User>, message: string) {
		if (message == '1z' || message == "'1z") this.oneArea(user);
		else if (message == '2z' || message == "'2z") this.twoArea(user);
		else if (message == '3z' || message == "'3z") this.threeArea(user);
	}

	private threeArea(user: InstanceType<typeof User>) {
		{
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date();
			hoursEnd.setHours(hoursEnd.getHours() + 2);
			sendSms(
				user,
				`Cars Région
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
			`
			);
		}
	}

	private oneArea(user: InstanceType<typeof User>) {
		{
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date();
			hoursEnd.setHours(hoursEnd.getHours() + 1);
			sendSms(
				user,
				`Cars Région
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
				`
			);
		}
	}

	private twoArea(user: InstanceType<typeof User>) {
		{
			const date = new Date();
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			const hoursEnd = new Date();
			hoursEnd.setHours(hoursEnd.getHours() + 2);
			sendSms(
				user,
				`Cars Région
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
				`
			);
		}
	}
}

export default tickets;
