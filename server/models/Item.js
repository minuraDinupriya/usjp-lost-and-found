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

  status: { 
    type: String, 
    default: 'Available'
  },
  createdBy: { 
    type: String, 
    required: true
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);