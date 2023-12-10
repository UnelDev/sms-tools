import Service from '../services/Service';
import User from '../user/User';

function bolderize(text: string) {
	let newText = '';
	for (var i = 0; i < text.length; i++) {
		const currentCode = text[i].codePointAt(0);

		if (currentCode >= 97 && currentCode <= 122) {
			newText += String.fromCodePoint(currentCode + 120_205);
		} else if (currentCode >= 65 && currentCode <= 90) {
			newText += String.fromCodePoint(currentCode + 120_211);
		} else if (currentCode >= 48 && currentCode <= 57) {
			newText += String.fromCodePoint(currentCode + 120_764);
		} else {
			newText += text[i];
		}
	}
	return newText;
}

function IsPhoneNumber(number: any) {
	if (typeof number != 'string') return false;
	if (!number.match(/^(?:\+33|0)\s*[1-9](?:\s*\d{2}){4}$/)) return false;

	return true;
}

function findUserByPhone(users: Array<User>, phoneNumber: string) {
	return users.find(usr => usr.phoneNumber == phoneNumber);
}

function findServiceByName(services: Array<Service>, name: string) {
	return services.find(serv => serv.name == name);
}

export { bolderize, IsPhoneNumber, findUserByPhone, findServiceByName };
