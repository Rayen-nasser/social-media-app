// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
const authenticateUser = require("../middlewares/authMiddleware");

// Middleware to attach Socket.IO to the request object
const attachSocketIO = (io) => {
  return (req, res, next) => {
    req.io = io; // Attach Socket.IO instance to the request object
    next(); // Pass control to the next middleware/route handler
  };
};

// Define the main function to create the routes
const createMessageRoutes = (io) => {
  // Use the middleware that attaches Socket.IO
  router.use(attachSocketIO(io));

  // Route to send a message
  router.post("/send", authenticateUser, sendMessage);

  // Route to get messages between two users
  router.get("/:userId", authenticateUser, getMessages);

  return router; // Return the configured router
};

// Export the function
module.exports = createMessageRoutes;
