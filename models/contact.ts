import mongoose from 'mongoose';

const ContactModel = new mongoose.Schema({
	createDate: { type: Date, default: Date.now },
	phoneNumber: { type: String, required: true },
	contactName: { type: String, required: false }
});

export const Contact = mongoose.model('Contact', ContactModel);
