const User = require('../models/User');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.id;
    const currentUserId = req.user.id;

    // Check if the user is already following
    if (req.user.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: 'You are already following this user.' });
    }

    // Update the following list for both users
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userIdToFollow }, $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(userIdToFollow, { $addToSet: { followers: currentUserId }, $inc: { followerCount: 1 } });

    res.status(200).json({ message: 'Successfully followed the user.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.user.id;

    // Check if the user is not following
    if (!req.user.following.includes(userIdToUnfollow)) {
      return res.status(400).json({ message: 'You are not following this user.' });
    }

    // Update the following list for both users
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: userIdToUnfollow }, $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userIdToUnfollow, { $pull: { followers: currentUserId }, $inc: { followerCount: -1 } });

    res.status(200).json({ message: 'Successfully unfollowed the user.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('followers', 'username email profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get following of a user
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('following', 'username email profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
