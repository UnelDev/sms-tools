import Service from './Service';

class CallSphere extends Service {
	constructor() {
		super();
		this.name = 'CallSphere';
	}

	newAction(user, message) {
		console.log('CallSphere: ' + message);
	}
}

export default CallSphere;
