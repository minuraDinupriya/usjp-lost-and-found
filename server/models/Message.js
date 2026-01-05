const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },   // The Item ID
  author: { type: String, required: true }, // Who sent it
  message: { type: String, required: true }, // The text
  time: { type: String, required: true },   // Display time (e.g. 10:30 PM)
  createdAt: { type: Date, default: Date.now } // Sorting time
});

module.exports = mongoose.model('Message', messageSchema);