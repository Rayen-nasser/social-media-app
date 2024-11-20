const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const postId = req.params.postId;

    // Ensure req.user is populated by the middleware
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newComment = new Comment({
      content,
      author: req.user._id, // Assign the logged-in user as the author
      post: postId,
      parentComment: parentComment || null, // Default to null if no parent comment
    });

    // Save the comment
    await newComment.save();

    // Update the post with the new comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Extract usernames from the comment content
    const usernames = content.match(/@(\w+)/g); // Matches usernames prefixed with '@'

    if (usernames) {
      // Remove the '@' symbol and find corresponding user IDs
      const usernameList = usernames.map((username) => username.slice(1));

      // Fetch users by their usernames
      const users = await User.find({ username: { $in: usernameList } });

      // Create notifications and emit them to the mentioned users
      users.forEach((user) => {
        const notification = new Notification({
          recipient: user._id,
          sender: req.user._id,
          type: "comment", // Define the type as 'comment'
          post: postId,
          isRead: false,
        });

        // Save notification (you might want to handle errors here)
        notification
          .save()
          .then(() => {
            // Emit notification to the recipient via Socket.IO
            req.io.to(user._id.toString()).emit("notification", {
              sender: req.user.username, // Include sender's username
              postId: postId,
              commentId: newComment._id,
              content: content,
            });
          })
          .catch((err) => {
            console.error("Error saving notification:", err);
          });
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error", error });
  }
};

// Get comments for a specific post
exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username"
    ); // Populate with author username
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a specific comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      req.body,
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a specific comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    // Optionally, update the post to decrease comment count
    await Post.findByIdAndUpdate(deletedComment.post, {
      $inc: { commentCount: -1 },
    });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// React to a comment with 'love'
exports.reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user already reacted with love
    const hasLoved = comment.reactions.love.includes(userId);

    if (hasLoved) {
      // If the user already reacted, remove their love reaction
      comment.reactions.love = comment.reactions.love.filter(
        (id) => !id.equals(userId)
      );
    } else {
      // Add the user's love reaction
      comment.reactions.love.push(userId);
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
