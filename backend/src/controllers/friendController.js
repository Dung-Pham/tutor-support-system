import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// Send Friend Request Controller
// Handles sending friend requests from one user to another
// Validates that users exist, aren't already friends, and no pending request exists
export const sendFriendRequest = async (req, res) => {
  try {
    // Check if the friend request already exists
    const { to, message } = req.body;
    const from = req.user.id;

    // Prevent self-friend requests
    if (from === to) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }

    // Verify target user exists
    const userExists = await User.exists({ _id: to });
    if (!userExists) {
      return res.status(404).json({ message: "The user does not exist." });
    }

    // Normalize user IDs for consistent friend lookup
    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }

    // Check for existing friendship and pending requests simultaneously
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    // Prevent duplicate friendships
    if (alreadyFriends) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    // Prevent duplicate friend requests
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you two." });
    }

    // Create new friend request
    const request = await FriendRequest.create({ from, to, message });

    return res.status(201).json({
      message: "Friend request sent successfully.",
      request,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Accept Friend Request Controller
// Handles accepting incoming friend requests
// Creates friendship record and removes the request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Find the friend request
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Ensure only the recipient can accept their own requests
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot accept this friend request." });
    }

    // Create friendship record (Friend model handles ID ordering)
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    // Remove the friend request after acceptance
    await FriendRequest.findByIdAndDelete(requestId);

    // Get friend details for response
    const from = await User.findById(request.from)
      .select("_id displayName email")
      .lean();

    return res.status(200).json({
      message: "Friend request accepted.",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        email: from?.avatarUrl, // Note: This seems to be a bug, should be from?.email
      },
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Decline Friend Request Controller
// Handles declining incoming friend requests
// Simply removes the friend request from database
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Find the friend request
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Ensure only the recipient can decline their own requests
    if (request.to.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You cannot decline this friend request." });
    }

    // Remove the friend request
    await FriendRequest.findByIdAndDelete(requestId);

    return res.status(200).json({ message: "Friend request declined." });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get All Friends Controller
// Retrieves the complete friends list for the authenticated user
// Returns friend details excluding the current user from each friendship
export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all friendships where current user is either userA or userB
    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate([
        { path: "userA", select: "_id displayName avatarUrl" },
        { path: "userB", select: "_id displayName avatarUrl" },
      ])
      .lean(); // Use lean() for better performance

    // Return empty array if no friends found
    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }

    // Extract friend user from each friendship (exclude current user)
    const friends = friendships.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Friend Requests Controller
// Retrieves all pending friend requests for the authenticated user
// Returns requests sent to the current user (incoming requests)
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const populateFields = "_id displayName avatarUrl";

    const [send, received] = await Promise.all([
      // Requests sent by current user
      FriendRequest.find({ from: userId })
        .populate("to", populateFields)
        .sort({ createdAt: -1 })
        .lean(),
      // Requests received by current user
      FriendRequest.find({ to: userId })
        .populate("from", populateFields)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    res.status(200).json({ send, received });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
