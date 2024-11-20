const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const postController = require("../controllers/postController");

const router = express.Router();

// Create a new post
router.post("/", authMiddleware, postController.createPost);

// Get all posts
router.get("/", postController.getAllPosts);

// Get posts by a specific user
router.get("/user/:userId", postController.getPostsByUser);

// Get a specific post by ID
router.get("/:id", postController.getPostById);

// Update a post
router.put("/:id", authMiddleware, postController.updatePost);

// Delete a post
router.delete("/:id", authMiddleware, postController.deletePost);

// Love a post
router.post("/:id/love", authMiddleware, postController.lovePost);

// Unlove a post
router.post("/:id/unlove", authMiddleware, postController.unlovePost);

module.exports = router;
