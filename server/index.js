const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const Item = require('./models/Item');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---

// 1. GET all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error });
  }
});

// 2. POST a new item (FIXED NAMING HERE)
app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file 
      ? `http://localhost:${PORT}/uploads/${req.file.filename}` 
      : req.body.image;

    // --- CRITICAL FIXES BELOW ---
    const newItem = new Item({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      category: req.body.category,       // Added (Required by DB)
      location: req.body.location,
      date: req.body.date,
      contactNumber: req.body.contact,   // Mapped 'contact' -> 'contactNumber'
      imageUrl: imageUrl                 // Mapped 'imageUrl' correctly
    });

    const savedItem = await newItem.save();
    console.log("✅ Item saved successfully:", savedItem.title);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("❌ Error saving item:", error); // Print error to terminal
    res.status(400).json({ message: 'Error saving item', error });
  }
});

// 3. GET items by type
app.get('/api/items/filter/:type', async (req, res) => {
  try {
    const items = await Item.find({ type: req.params.type }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error filtering items', error });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('USJP Lost & Found API is Running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});