// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path to User model

const authenticateUser = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token
    const user = await User.findById(decoded.id); // Find user by decoded ID
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Set user in request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateUser;
