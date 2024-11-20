const express = require("express");
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  reactToComment,
} = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to create a new comment
router.post("/posts/:postId/comments", authMiddleware, createComment);

// Route to get all comments for a specific post
router.get("/posts/:postId/comments", authMiddleware, getCommentsByPost);

// Route to update a specific comment
router.put("/comments/:commentId", authMiddleware, updateComment);

// Route to delete a specific comment
router.delete("/comments/:commentId", authMiddleware, deleteComment);

// Route to react to a comment with 'love'
router.post("/comments/:commentId/react", authMiddleware, reactToComment);

module.exports = router;
