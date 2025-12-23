/**
 * File: routes/conversationRoute.ts
 * Mục đích: Conversation routes
 */

import { Router } from "express";
import {
  createConversation,
  getConversations,
  getMessages,
} from "../controllers/conversationController.js";

const router = Router();

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);

export default router;
