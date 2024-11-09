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

	const auth = 'Basic ' + Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64');
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: auth
		},
		body: JSON.stringify({
			message,
			phoneNumbers: [phoneNumber]
		})
	};

	// Envoi de la requête
	const res = await fetch('http://192.168.1.193:8080/message', options);
	if (res.status != 202) {
		console.log('[' + chalk.red('ERROR') + ']' + ' send error ' + res.statusText);
	}
}

export default sendSms;
