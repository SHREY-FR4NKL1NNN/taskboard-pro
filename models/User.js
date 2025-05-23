const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String }, // optional
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
