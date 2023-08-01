import fs from "fs";
import user from "./user";

export default function restoreUsersFromFile(): Array<user> {
	if (fs.existsSync("./datas/UserSave.json")) {
		const userData: any[] = JSON.parse(
			fs.readFileSync("./datas/UserSave.json")?.toString()
		);

		return userData.map((userData) => {
			const restoredUser = new user(userData.phoneNumber);
			restoredUser.firstMessage = userData.firstMessage;
			restoredUser.receviedHistory = userData.receviedHistory;
			restoredUser.sendHistory = userData.sendHistory;
			return restoredUser;
		});
	}

	return [];
}
