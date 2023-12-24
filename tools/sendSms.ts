import axios from 'axios';
import chalk from 'chalk';

async function sendSms(phoneNumber: string, message: string) {
	const phoneArray = phoneNumber.split('');
	if (phoneArray[0] == '0') {
		phoneArray.shift();
		phoneArray.unshift('3');
		phoneArray.unshift('3');
		phoneArray.unshift('+');
		phoneNumber = phoneArray.join('');
	} else if (phoneNumber[0] != '+') {
		console.log('[' + chalk.red('ERROR') + '] Bad phoneNumber: ' + phoneNumber);
		return;
	}
	console.log(`[>${chalk.green(phoneNumber)}>] ${message}`);

	const url = `http://${process.env.PHONE_IP}/v1/sms/`;
	const data = new URLSearchParams();
	data.append('phone', phoneNumber);
	data.append('message', message);

	axios
		.post(url, data)
		.then(response => {
			if (response.data != 'OK') console.log(response.data);
		})
		.catch(error => {
			console.error(error);
		});
}

export default sendSms;
