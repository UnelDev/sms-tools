
import * as dotenv from "dotenv";
import models from "../models";
import sms from "../smsSender";
import fs from "node:fs";
dotenv.config();

export default function adminAction(phoneNumber:string, message:string, models: models, sms: sms){
	if(process.env.ADMIN_NUMBER?.includes(phoneNumber)){
		message = message.toLocaleLowerCase();
		while(message.startsWith(' ')){const array = message.split(""); array.shift(); message = array.join("")};
		while(message.endsWith(' ')){const array = message.split(""); array.pop(); message = array.join("")};

		if(message == 'restart'){ 
			models.restart();
			sms.sendSms(phoneNumber, 'restarting ...');
		}else if (message == 'ping'){
			const start = Date.now();
			new Promise((resolve, reject) => {
				models.send('respond by pong', (msg)=>{resolve(msg)});
			}).then(()=>{
				sms.sendSms(phoneNumber,'the models respond in '+ (Date.now() - start)+'ms');
			});
		}else if(message.startsWith('ban')){
			const messageArray: [string, string, string|undefined] = message.split(' ') as [string, string, string|undefined];

			fs.readFile('./admin/ban.json', 'utf8', (err, data) => {
				const banList:Array<[string, Date]> = JSON.parse(data??'[]');
				const timeEnd = messageArray[2] ? parseInt(messageArray[2])+Date.now()	:	8640000000000000
				banList.push([messageArray[1], new Date(timeEnd)]);
				console.log(banList);
				fs.writeFile('./admin/ban.json', JSON.stringify(banList), (err) => {
					if (err) throw err;
				});
			});

			sms.sendSms(messageArray[1], 'you\'ve been banned by an anministrator');
		}else{
			sms.sendSms(phoneNumber, 'unknown command');
		}
	}else{
		sms.sendSms(phoneNumber, process.env.ADMIN_NUMBER as string);
		sms.sendSms(phoneNumber, 'you\'r not admin');
	}
}