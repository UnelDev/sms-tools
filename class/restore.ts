import fs from "fs";
import user from "./user";
import admin from "./admin";

function restoreUsersFromFile(): Array<user> {
	if (fs.existsSync("./datas/UserSave.json")) {
		const userData: user[] = JSON.parse(
			fs.readFileSync("./datas/UserSave.json")?.toString() ?? '[]'
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

function restoreadminFromFile(): Array<admin> {
	if (fs.existsSync("./datas/adminSave.json")) {
		const adminData: admin[] = JSON.parse(
			fs.readFileSync("./datas/adminSave.json")?.toString() ?? '[]'
		);

		return adminData.map((adminData) => {
			const restoredadmin = new admin(adminData.phoneNumber);
			restoredadmin.receviedHistory = adminData.receviedHistory;
			restoredadmin.sendHistory = adminData.sendHistory;
			return restoredadmin;
		});
	}

	return [];
}

export { restoreUsersFromFile, restoreadminFromFile };
