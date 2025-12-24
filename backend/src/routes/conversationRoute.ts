/**
 * File: routes/conversationRoute.ts
 * Mục đích: Conversation routes
 */

import { Router } from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markConversationAsSeen,
} from "../controllers/conversationController.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

router.post("/", wrap(createConversation));
router.get("/", wrap(getConversations));
router.get("/:conversationId/messages", wrap(getMessages));
router.post("/:conversationId/mark-seen", wrap(markConversationAsSeen));

export default router;
