const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (req, res) => {
    const { recipient, sender, type, post } = req.body;

    try {
        const notification = new Notification({ recipient, sender, type, post });
        await notification.save();
        
        // Emit the notification to the recipient in real-time (assuming Socket.IO is connected)
        req.io.to(recipient).emit('notification', notification);

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Error creating notification' });
    }
};

// Get all notifications for a specific recipient
exports.getNotifications = async (req, res) => {
    const { recipientId } = req.params;

    try {
        const notifications = await Notification.find({ recipient: recipientId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('post', 'title');

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
};



// Function to delete notifications based on their age and read status
exports.deleteOldNotifications = async () => {
    const currentDate = new Date();
  
    // Calculate dates for 90 days and 30 days ago
    const ninetyDaysAgo = new Date(currentDate);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
    try {
      // Delete unread notifications older than 90 days
      await Notification.deleteMany({
        isRead: false,
        createdAt: { $lte: ninetyDaysAgo }
      });
  
      // Delete read notifications older than 30 days
      await Notification.deleteMany({
        isRead: true,
        createdAt: { $lte: thirtyDaysAgo }
      });
  
      console.log("Old notifications cleaned up successfully.");
    } catch (error) {
      console.error("Error deleting old notifications:", error);
    }
  };
  