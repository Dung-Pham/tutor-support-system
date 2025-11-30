import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";

const router = express.Router();

// Create a new conversation between users
router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);

// Get messages in a conversation
router.get("/:conversationId/messages", getMessages);

export default router;
