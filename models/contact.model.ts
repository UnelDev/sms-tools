import mongoose from 'mongoose';

const ContactModel = new mongoose.Schema({
	createDate: { type: Date, default: Date.now },
	phoneNumber: { type: String, required: true },
	contactName: { type: String, require: false, index: true, unique: true, sparse: true }
});

export const Contact = mongoose.model('Contact', ContactModel);
