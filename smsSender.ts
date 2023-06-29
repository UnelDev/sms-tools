import { exec } from 'child_process';

export default class sms{
	processing: boolean;
	sendingList: Array<[string, string]>;
	constructor(){
		this.processing = false;
		this.sendingList = [];
	}
	sendSms(phoneNumber:string, message:string){
		this.sendingList.push([phoneNumber,  message]);
		this.sendinAdb();
	}
	
	private sendinAdb(){
		if(this.processing||this.sendingList.length == 0){return}
		this.processing = true;
		const phoneNumber = this.sendingList[0][0];
		const message = this.sendingList[0][1];
		// Check if ADB is installed
		exec('adb version', (error: any, stdout:any, stderr: any) => {
			if (error || stderr) {
				console.log("ADB is not installed. Please install Android Debug Bridge (ADB) to run this program.");
				process.exit(1);
			}
			
			// Check if an Android device is connected
			exec('adb devices', (error, stdout) => {
				const devices = stdout.split('\n').slice(1).filter(line => line.includes('device'));
				if (devices.length === 0) {
					console.log("No Android device is connected. Please connect a device to run this program.");
					process.exit(1);
				}
				
				// Send the SMS
				exec(`adb shell "am start -a android.intent.action.SENDTO -d sms:${phoneNumber} --es sms_body \\"${message 	}\\" --ez exit_on_sent true"`, (error, stdout, stderr) => {
					if (error || stderr) {
					console.log("An error occurred while sending the SMS.");
					process.exit(1);
					}
					
					// Wait for 1 second
					setTimeout(() => {
					// Click coordinates
					const x = 979;
					const y = 2245;

					// Tap the button at the specified position
					exec(`adb shell input tap ${x} ${y}`, (error: any, stdout:any, stderr: any) => {
						if (error || stderr) {
						console.log("An error occurred while tapping the button.");
						process.exit(1);
						}
						setTimeout(()=>{
							exec('adb shell "am force-stop com.moez.QKSMS"');
							this.sendingList.shift();
							this.processing = false;
							this.sendinAdb();
						}, 500);
					});
					}, 1000);
				});
			});
		});
	}
}