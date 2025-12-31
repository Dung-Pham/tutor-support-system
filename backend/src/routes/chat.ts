/**
 * File: routes/chat.ts
 * Mục đích: Define routes cho chat & notifications
 */

import { Router } from 'express';
import * as chatController from '../controllers/chatController';
import { sendMessageValidation, createNotificationValidation, idParamValidation } from '../utils/validator';

const router = Router();

// Chat routes
router.post('/messages', sendMessageValidation(), chatController.sendMessage);
router.get('/conversations', chatController.getRecentConversations);
router.get('/conversations/:otherUserId', idParamValidation('otherUserId'), chatController.getConversation);
router.post('/messages/:messageId/read', idParamValidation('messageId'), chatController.markAsRead);
router.get('/messages/unread/count', chatController.getUnreadCount);

// Notification routes
router.post('/notifications', createNotificationValidation(), chatController.createNotification);
router.get('/notifications', chatController.getNotifications);
router.post('/notifications/:notificationId/read', idParamValidation('notificationId'), chatController.markNotificationAsRead);
router.get('/notifications/unread/count', chatController.getUnreadNotificationCount);

export default router;
