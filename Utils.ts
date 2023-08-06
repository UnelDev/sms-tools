import admin from "./class/admin";
import user from "./class/user";

function IsPhoneNumber(number: any) {
	if (typeof number != 'string') return false;
	if (!number.match(/^(?:\+33|0)\s*[1-9](?:\s*\d{2}){4}$/)) return false;

	return true;
}

function isAdminPhoneNumber(adminArray: Array<admin>, phoneNumber: string): boolean {
	let isAdmin = false;
	adminArray.forEach((adminInstance) => {
		if (adminInstance.phoneNumber == phoneNumber) {
			isAdmin = true;
		}
	});
	return isAdmin;
}

function isUserPhoneNumber(UserArray: Array<user>, phoneNumber: string): boolean {
	let isUser = false;
	UserArray.forEach((UserInstance) => {
		if (UserInstance.phoneNumber == phoneNumber) {
			isUser = true;
		}
	});
	return isUser;
}

function getAdminByPhoneNumber(adminArray: Array<admin>, phoneNumber: string): admin | undefined {
	let admin: admin | undefined = undefined;
	adminArray.forEach((adminInstance) => {
		if (adminInstance.phoneNumber == phoneNumber) {
			admin = adminInstance;
		}
	});
	return (admin);
}

function getUserByPhoneNumber(UserArray: Array<user>, phoneNumber: string): user | undefined {
	let user: user | undefined = undefined;
	UserArray.forEach((UserInstance) => {
		if (UserInstance.phoneNumber == phoneNumber) {
			user = UserInstance;
		}
	});
	return (user);
}

export { IsPhoneNumber, isAdminPhoneNumber, isUserPhoneNumber, getAdminByPhoneNumber, getUserByPhoneNumber };