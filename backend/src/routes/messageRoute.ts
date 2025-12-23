/**
 * File: routes/messageRoute.ts
 * Mục đích: Message routes
 */

import { Router } from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/messageController.js";

const router = Router();

router.post("/direct", sendDirectMessage);
router.post("/group", sendGroupMessage);

export default router;
