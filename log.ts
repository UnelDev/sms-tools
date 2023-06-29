import fs from 'fs';

function logConv(phoneNumber: string, question: string, answer: string) {
	console.log({ phoneNumber, question, answer });
	if (fs.existsSync('./datas/convSave.json')) {
		const convArray: Array<[string, string, string]> = JSON.parse(fs.readFileSync('./datas/convSave.json')?.toString());
		convArray.push([phoneNumber, question, answer]);
		fs.writeFileSync('./datas/convSave.json', JSON.stringify(convArray));
	} else {
		const convArray = [[phoneNumber, question, answer]];
		fs.writeFileSync('./datas/convSave.json', JSON.stringify(convArray));
	}
}

export { logConv };