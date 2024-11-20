// controllers/messageController.js
const Message = require("../models/Message");
const Notification = require("../models/Notification")

exports.sendMessage = async (req, res) => {
  const { sender, receiver, content, media } = req.body;
  
  try {
    // Create and save the new message
    const message = new Message({ sender, receiver, content, media });
    await message.save();

    // Check if the receiver is currently connected
    const isReceiverConnected = req.io.sockets.adapter.rooms.get(receiver);

    if (isReceiverConnected) {
      // If the receiver is connected, emit the message in real-time
      req.io.to(receiver).emit("message", message);
    } else {
      // If the receiver is not connected, save a notification in the database
      const notification = new Notification({
        recipient: receiver,
        sender,
        type: 'message'
      });
      await notification.save();
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Error sending message" });
  }
};

exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  const { receiverId } = req.query;

  try {
    // Fetch messages for the user and the receiver
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ sentAt: 1 });

    // If there are messages, mark them as read
    if (messages.length > 0) {
      // Update all messages sent to the user from the other user to mark them as read
      await Message.updateMany(
        {
          sender: receiverId,
          receiver: userId,
          isRead: false, // Only update unread messages
        },
        {
          $set: { isRead: true },
        }
      );
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Error fetching messages" });
  }
};
