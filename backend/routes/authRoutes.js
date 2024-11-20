const express = require("express");
const {
  login,
  register,
  getUserProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
// Sign up route
router.post("/register", register);

// Sign in route
router.post("/login", login);

// Get user info route (protected)
router.get("/me", authMiddleware, getUserProfile);

module.exports = router;
