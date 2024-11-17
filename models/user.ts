import mongoose from 'mongoose';

const UserModel = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true }
});

export const User = mongoose.model('User', UserModel);
