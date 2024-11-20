// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http"); // Import HTTP to wrap the Express app
const { Server } = require("socket.io"); // Import Socket.IO
const cron = require('node-cron');



// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create an HTTP server and wrap the Express app
const server = http.createServer(app);

// Set up Socket.IO on the server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin for development
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const createMessageRoutes = require("./routes/messageRoutes");
const createNotificationRoutes = require("./routes/notificationRoutes");
const { deleteOldNotifications } = require("./controllers/notificationController");

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", createMessageRoutes(io)); 
app.use("/api/notifications", createNotificationRoutes(io)); 

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', deleteOldNotifications);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Example of a custom event listener
  socket.on("message", (data) => {
    console.log("Message received:", data);
    io.emit("message", data); // Broadcast message to all connected clients
  });

  socket.on("notification", (data) => {
    console.log("notification received:", data);
    io.emit("notification", data); // Broadcast message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Welcome to the Social Media API");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
