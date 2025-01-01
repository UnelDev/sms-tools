import { User } from '../../models/user.model';
import { SmsSender } from '../../tools/sendSms';

class apiClass {
	name: string;
	description: string;
	version: string;
	type: 'message' | 'command';
	commands: Array<String>;
	bypassTrigger: Array<String>;
	constructor() {
		this.name = 'main services';
		this.description = 'default class for all services';
		this.version = '1.0';
		this.type = 'command';
		this.commands = [];
		this.bypassTrigger = [];
	}
	newMessage(contact: InstanceType<typeof User>, message: string, smsSender: SmsSender) {
		smsSender.sendSms(
			contact,
			'your message has been received by ' + this.name + ', but the service has no response to give you',
			undefined,
			this.name
		);
	}
}

export default apiClass;
