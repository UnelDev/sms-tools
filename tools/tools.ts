import Service from '../services/Service';
import User from '../user/User';

function bolderize(text: string) {
	return text
		.split('')
		.map(char => {
			const code = char.codePointAt(0);

			if (typeof code == 'undefined') return char;

			if (code >= 97 && code <= 122) {
				return String.fromCodePoint(code + 120_205);
			} else if (code >= 65 && code <= 90) {
				return String.fromCodePoint(code + 120_211);
			} else if (code >= 48 && code <= 57) {
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

function findUserByPhone(users: Array<User>, phoneNumber: string) {
	return users.find(usr => usr.phoneNumber == phoneNumber);
}

function findServiceByName(services: Array<Service>, name: string) {
	return services.find(serv => serv.name == name);
}

export { IsPhoneNumber, bolderize, findServiceByName, findUserByPhone };
