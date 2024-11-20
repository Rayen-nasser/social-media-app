// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: [{ type: String }], // URLs to images, videos, etc.
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: {
    love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isEphemeral: { type: Boolean, default: false }, // Disappears after 24 hours
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
