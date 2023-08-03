import admin from "./class/admin";
import sms from "./class/smsSender";
import user from "./class/user";

export default function command(message: string, phoneNumber: string, smsAPI: sms, adminArray: Array<admin>, userArray: Array<user>) {
	message.trim();
	if (isAdminPhoneNumber(adminArray, phoneNumber)) {

	} else if (isUserPhoneNumber(userArray, phoneNumber)) {

	}
}

function isAdminPhoneNumber(adminArray: Array<admin>, phoneNumber: string): boolean {
	let isAdmin = false;
	adminArray.forEach((adminInstance) => {
		if (adminInstance.phoneNumber === phoneNumber) {
			isAdmin = true;
		}
	});
	return isAdmin;
}

function isUserPhoneNumber(UserArray: Array<user>, phoneNumber: string): boolean {
	let isUser = false;
	UserArray.forEach((UserInstance) => {
		if (UserInstance.phoneNumber === phoneNumber) {
			isUser = true;
		}
	});
	return isUser;
}