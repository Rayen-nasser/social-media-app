const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
  const { content, media, tags, isEphemeral } = req.body;

  try {
    const post = new Post({
      content,
      author: req.user.id,
      media,
      tags,
      isEphemeral,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email').sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

// Get posts by a specific user
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId }).populate('author', 'username email profilePicture');

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  const { content, media, tags, isEphemeral } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the author is updating their own post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this post' });
    }

    // Update post fields
    post.content = content || post.content;
    post.media = media || post.media;
    post.tags = tags || post.tags;
    post.isEphemeral = isEphemeral !== undefined ? isEphemeral : post.isEphemeral;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the author is deleting their own post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
};

// Love a post
exports.lovePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user already loved the post
    if (post.reactions.love.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already loved this post' });
    }

    post.reactions.love.push(req.user.id);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error loving post', error });
  }
};

// Unlove a post
exports.unlovePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has loved the post
    if (!post.reactions.love.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have not loved this post' });
    }

    post.reactions.love.pull(req.user.id); // Remove the love
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error unloving post', error });
  }
};
