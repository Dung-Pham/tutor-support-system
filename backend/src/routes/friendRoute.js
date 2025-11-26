import express from "express";

import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequests,
} from "../controllers/friendController.js";

const router = express.Router();

// Send friend request
router.post("/requests", sendFriendRequest);

// Accept friend request
router.post("/requests/:requestId/accept", acceptFriendRequest);

// Decline friend request
router.post("/requests/:requestId/decline", declineFriendRequest);

// Get friends list
router.get("/", getAllFriends);

// Get friend requests list
router.get("/requests", getFriendRequests);

export default router;
