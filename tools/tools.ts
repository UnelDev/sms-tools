/**
 * Converts the input text to a bold Unicode variant.
 *
 * This function takes a string and transforms each character into its bold Unicode equivalent,
 * if such an equivalent exists. It supports bold transformation for lowercase letters (a-z),
 * uppercase letters (A-Z), and digits (0-9). Characters outside these ranges are not transformed.
 *
 * @param text - The input string to be transformed.
 * @returns The transformed string with bold Unicode characters.
 */
function bolderize(text: string) {
	return text
		.split('')
		.map(char => {
			const code = char.codePointAt(0);

			if (typeof code == 'undefined') return char;

			if (code >= 97 && code <= 122) {
				// a-z
				return String.fromCodePoint(code + 120_205);
			} else if (code >= 65 && code <= 90) {
				// A-Z
				return String.fromCodePoint(code + 120_211);
			} else if (code >= 48 && code <= 57) {
				//0-9
				return String.fromCodePoint(code + 120_764);
			}
			return char;
		})
		.join('');
}

function IsPhoneNumber(number: any) {
	if (typeof number != 'string') return false;
	if (!number.match(/^(?:\+33|0)\s*[1-9](?:\s*\d{2}){4}$/)) return false;

	return true;
}

function getFileName(filename: string) {
	return filename?.split('\\')?.at(-1)?.split('/')?.at(-1) ?? 'error';
}

function clearPhone(phone: string): string | null {
	const phoneArray = phone.split('');
	if (phoneArray[0] == '0') {
		phoneArray.shift();
		phoneArray.unshift('3');
		phoneArray.unshift('3');
		phoneArray.unshift('+');
		phone = phoneArray.join('');
	} else if (phone[0] != '+') {
		return null;
	}
	return phone;
}
export { bolderize, clearPhone, getFileName, IsPhoneNumber };
