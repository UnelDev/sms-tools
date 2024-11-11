import mongoose from 'mongoose';

const MessageModel = new mongoose.Schema({
	date: { type: Date, default: Date.now },
	contactID: { type: String, required: true },
	message: { type: String, required: true },
	direction: { type: Boolean, required: true }, // in or out in: true, out: false
	status: {
		type: String,
		enum: ['received', 'sent', 'delivered', 'failed', 'pending'],
		default: 'pending',
		required: true,
		index: true
	},
	messageId: { type: String, required: false, index: true, unique: true, sparse: true },
	deliveredAt: { type: Date, required: false },
	sendAt: { type: Date, required: false }
});

export const Message = mongoose.model('Message', MessageModel);
