import User from '../user/User';
import fs from 'fs';

function restoreUsersFromFile(): Array<User> {
	if (fs.existsSync('./datas/UserSave.json')) {
		const userData: User[] = JSON.parse(fs.readFileSync('./datas/UserSave.json')?.toString() ?? '[]', reviver);
		return userData.map(userData => {
			const restoredUser = new User(userData.phoneNumber, userData.lastMessage, userData.otherInfo);
			return restoredUser;
		});
		function reviver(key: string, value: any) {
			if (typeof value === 'object' && value !== null) {
				if (value.dataType === 'Map') {
					return new Map(value.value);
				}
			}
			return value;
		}
	}

	return [];
}
export default restoreUsersFromFile;
