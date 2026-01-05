const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Lost', 'Found'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  
  // --- NEW FIELDS ADDED ---
  status: { 
    type: String, 
    default: 'Available' // Keeps track if item is Solved/Claimed
  },
  createdBy: { 
    type: String, 
    required: true       // Stores the User ID so we know who owns it
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);