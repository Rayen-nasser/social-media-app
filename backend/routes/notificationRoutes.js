const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const { attachSocketIO } = require("../middlewares/socketMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");

// Define the main function to create the routes
const createNotificationRoutes = (io) => {
  // Use the middleware that attaches Socket.IO
  router.use(attachSocketIO(io));

  // Route to create a new notification
  router.post("/", authenticateUser, createNotification);

  // Route to get all notifications for a recipient
  router.get("/:recipientId", authenticateUser, getNotifications);

  // Route to mark a notification as read
  router.put("/:notificationId/read", authenticateUser, markAsRead);

  return router; // Return the configured router
};

module.exports = createNotificationRoutes;
