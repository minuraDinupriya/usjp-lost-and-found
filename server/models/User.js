const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will store this encrypted!
});

module.exports = mongoose.model('User', userSchema);