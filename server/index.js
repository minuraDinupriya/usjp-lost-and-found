const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const Item = require("./models/Item");
const authRoutes = require("./routes/auth");
const Message = require("./models/Message");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);

// Logger
app.use((req, res, next) => {
  console.log(
    `📢 [${new Date().toLocaleTimeString()}] ${req.method} request to ${
      req.url
    }`
  );
  next();
});

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/usjp_lost_found")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Security Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });
  const tokenString = token.startsWith("Bearer ") ? token.slice(7) : token;
  jwt.verify(tokenString, "my_super_secret_key_123", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.id;
    next();
  });
};
// --- SOCKET.IO LOGIC (With Database Persistence) ---
io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // 1. Join Room & Load History
  socket.on("join_room", async (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);

    try {
      // Fetch previous messages from MongoDB
      const history = await Message.find({ room }).sort({ createdAt: 1 });
      // Send history ONLY to the user who just joined
      socket.emit("load_messages", history);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  });

  // 2. Send Message & Save to DB
  socket.on("send_message", async (data) => {
    try {
      // Save to MongoDB first
      const newMsg = new Message(data);
      await newMsg.save();

      // Then broadcast to everyone in the room
      io.in(data.room).emit("receive_message", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// --- API ROUTES ---

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// 2. POST a new item (Create)
app.post(
  "/api/items",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
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

        // ✅ FIX: Map the frontend 'contact' to backend 'contactNumber'
        contactNumber: req.body.contact,

        imageUrl: imageUrl,
        createdBy: req.userId,
        status: "Available",
      });

      const savedItem = await newItem.save();
      console.log("✅ Item saved:", savedItem.title);
      res.status(201).json(savedItem);
    } catch (error) {
      console.error("❌ Error saving item:", error);
      // This prints the exact reason for the 400 error in your terminal
      res.status(400).json({ message: "Error saving item", error });
    }
  }
);

app.delete("/api/items/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.createdBy !== req.userId)
      return res.status(403).json({ message: "Only owner can delete" });
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting" });
  }
});

app.put(
  "/api/items/:id",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (item.createdBy !== req.userId)
        return res.status(403).json({ message: "Only owner can edit" });
      const updateData = { ...req.body };
      if (req.file)
        updateData.imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating" });
    }
  }
);

app.patch("/api/items/:id/claim", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.createdBy !== req.userId)
      return res.status(403).json({ message: "Only owner can mark solved" });
    item.status = "Claimed";
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// START SERVER
server.listen(PORT, () => {
  console.log(`🚀 Server (HTTP + Socket) running on http://localhost:${PORT}`);
});
