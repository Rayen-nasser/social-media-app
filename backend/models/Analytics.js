// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postsViewed: { type: Number, default: 0 },
  likesReceived: { type: Number, default: 0 },
  commentsReceived: { type: Number, default: 0 },
  followersGained: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
