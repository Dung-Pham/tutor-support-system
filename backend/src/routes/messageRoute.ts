// Message routes

import { Router } from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
  markMessageAsSeen,
  deleteMessage,
  editMessage,
} from "../controllers/messageController.js";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn: any) => fn;

// Send messages
router.post("/direct", wrap(sendDirectMessage));
router.post("/group", wrap(sendGroupMessage));

// Message actions
router.patch("/:messageId/seen", wrap(markMessageAsSeen));
router.patch("/:messageId", wrap(editMessage));
router.delete("/:messageId", wrap(deleteMessage));

export default router;
