import express from 'express';
import models from './models';
import adminAction from './admin/Commands';
import sms from './smsSender';
import isBan from './admin/checkBan';
var app = express();
//express
const port = 5000

app.post('/', function (req) {
	// is corect message ?
	if(typeof req.query.message != 'string' || typeof req.query.contact != 'string'){return}
	let phoneNumber = req.query.contact;
	let message = req.query.message;
	//clear request
	if(phoneNumber.startsWith('+33')){phoneNumber = phoneNumber.replace('+33','0')}
	//is ban ?
	if(isBan(phoneNumber)){console.log('user banned : '+phoneNumber+' send message'); return};
	
	//command ?
	if((message).startsWith('!')){
		console.log('message from '+phoneNumber+' : '+message);
		message = message.replace('!','');
		adminAction(phoneNumber, message, myModel, mySms);
	}else{
		//ask to llama
		process.stdout.write('message from '+phoneNumber +' : ');
		myModel.send(message, (message)=>{console.log('    '+message); mySms.sendSms(phoneNumber, message)});
	}
});

app.listen(port, () => {
	console.clear();
	console.log(`Example app listening on port ${port}`)
});
const mySms = new sms();
const myModel = new models('/home/unel/Documents/llama.cpp/examples/myChat.sh');