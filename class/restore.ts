import fs from "fs";
import user from "./user";
import admin from "./admin";

function restoreUsersFromFile(): Array<user> {
	if (fs.existsSync("./datas/UserSave.json")) {
		const userData: user[] = JSON.parse(
			fs.readFileSync("./datas/UserSave.json")?.toString() ?? '[]'
		);
		return userData.map((userData) => {
			const restoredUser = new user(userData.phoneNumber,
				userData.firstMessage,
				userData.receviedHistory,
				userData.sendHistory,
				userData.isBan,
				userData.lastMessage);
			return restoredUser;
		});
	}

	return [];
}

function restoreadminFromFile(): Array<admin> {
	if (fs.existsSync("./datas/AdminSave.json")) {
		const adminData: admin[] = JSON.parse(
			fs.readFileSync("./datas/AdminSave.json")?.toString() ?? '[]'
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
