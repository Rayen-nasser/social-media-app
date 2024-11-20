// middlewares/socketMiddleware.js
exports.attachSocketIO = (io) => {
  return (req, res, next) => {
    req.io = io; // Attach Socket.IO instance to the request object
    next(); // Pass control to the next middleware/route handler
  };
};
