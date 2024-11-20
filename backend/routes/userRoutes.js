// userRoutes.js

const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// Follow a user
router.post("/:id/follow", authMiddleware, userController.followUser);

// Unfollow a user
router.post("/:id/unfollow", authMiddleware, userController.unfollowUser);

// Get followers of a user
router.get("/:id/followers", userController.getFollowers);

// Get following of a user
router.get("/:id/following", userController.getFollowing);

module.exports = router;
