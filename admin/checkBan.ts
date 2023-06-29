import fs from 'fs';


export default function isBan(phoneNumber: string): boolean {
	let isBanned = false;

	const entries: [string, string][] = JSON.parse(fs.readFileSync('./datas/banList.json')?.toString());
	if (entries.length == 0) return false;
	const newEntries: [string, string][] = [];

	entries.forEach(ban => {
		if (new Date(ban[1]).getTime() > Date.now()) {
			newEntries.push(ban);
			if (ban[0] == phoneNumber) {
				isBanned = true;
			}
		}
	});

	fs.writeFileSync('./datas/banList.json', JSON.stringify(newEntries));

	return isBanned;
}
