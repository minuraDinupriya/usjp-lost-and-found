const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken'); // Keep this for Login Security
const Item = require('./models/Item');
const authRoutes = require('./routes/auth');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Standard CORS is fine now
app.use(express.json());
app.use('/uploads', express.static('uploads')); 
app.use('/api/auth', authRoutes);

// Logger
app.use((req, res, next) => {
  console.log(`📢 [${new Date().toLocaleTimeString()}] ${req.method} request to ${req.url}`);
  next();
});

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/usjp_lost_found')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- SECURITY MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  // Remove "Bearer " prefix if present
  const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(tokenString, 'my_super_secret_key_123', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id; // Save User ID
    next();
  });
};

// --- API ROUTES ---

// 1. GET all items (Public)
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error });
  }
});

// 2. POST a new item (Secured: Saves Owner)
app.post('/api/items', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file 
      ? `http://localhost:${PORT}/uploads/${req.file.filename}` 
      : req.body.image;

    const newItem = new Item({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      category: req.body.category,
      location: req.body.location,
      date: req.body.date,
      contactNumber: req.body.contact, 
      imageUrl: imageUrl,
      
      // Security Fields
      createdBy: req.userId,
      status: 'Available'
    });

    const savedItem = await newItem.save();
    console.log("✅ Item saved:", savedItem.title);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("❌ Error saving item:", error);
    res.status(400).json({ message: 'Error saving item', error });
  }
});

// 3. DELETE an item (Strict: Only Owner)
app.delete('/api/items/:id', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error });
  }
});

// 4. UPDATE an item (Strict: Only Owner)
app.put('/api/items/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can edit this item' });
    }

    const updateData = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        category: req.body.category,
        location: req.body.location,
        date: req.body.date,
        contactNumber: req.body.contact,
    };

    if (req.file) {
      updateData.imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error });
  }
});

// 5. MARK AS CLAIMED (STRICT: Only Owner can do this)
app.patch('/api/items/:id/claim', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // --- SECURITY CHECK ---
    // If the person clicking is NOT the owner, block them!
    if (item.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Only the uploader can mark this as solved' });
    }

    item.status = 'Claimed';
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('USJP Lost & Found API is Running...');
});

// Start Server (Standard Express)
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});