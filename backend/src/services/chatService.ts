/**
 * File: services/chatService.ts
 * Mục đích: Business logic cho chat & notifications
 * Vai trò: Handle messaging, notifications, unread counts
 */

import {
  ChatMessage,
  SendMessageDTO,
  Notification,
  CreateNotificationDTO,
  NotificationType
} from '../types';
import { executeQuery } from '../utils/database';
import { QueryTypes } from 'sequelize';

// ============ Chat Management ============

/**
 * Send message
 */
export const sendMessage = async (senderId: number, data: SendMessageDTO): Promise<ChatMessage> => {
  const attachmentsJson = data.attachments ? JSON.stringify(data.attachments) : null;
  
  const insertQuery = `
    INSERT INTO ChatMessage (senderId, receiverId, scheduleId, messageType, content, attachments, isRead, createdAt)
    OUTPUT INSERTED.*
    VALUES (:senderId, :receiverId, :scheduleId, :messageType, :content, :attachments, 0, GETDATE())
  `;
  
  const result = await executeQuery<ChatMessage[]>(insertQuery, {
    senderId,
    receiverId: data.receiverId,
    scheduleId: data.scheduleId || null,
    messageType: data.messageType,
    content: data.content,
    attachments: attachmentsJson
  }, QueryTypes.INSERT);
  
  // Create notification for receiver
  await createNotification({
    userId: data.receiverId,
    type: NotificationType.MESSAGE_RECEIVED,
    title: 'New Message',
    message: `You have a new message`,
    data: { messageId: result[0].messageId, senderId }
  });
  
  return result[0];
};

/**
 * Get message by ID
 */
export const getMessageById = async (messageId: number): Promise<ChatMessage | null> => {
  const query = `
    SELECT m.*,
           s.fullName as senderName,
           r.fullName as receiverName
    FROM ChatMessage m
    JOIN [User] s ON m.senderId = s.userId
    JOIN [User] r ON m.receiverId = r.userId
    WHERE m.messageId = :messageId
  `;
  
  const result = await executeQuery<any[]>(query, { messageId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Get conversation between two users
 */
export const getConversation = async (
  userId1: number,
  userId2: number,
  page: number = 1,
  limit: number = 50
): Promise<{ items: ChatMessage[]; totalItems: number }> => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT m.*,
           s.fullName as senderName,
           r.fullName as receiverName
    FROM ChatMessage m
    JOIN [User] s ON m.senderId = s.userId
    JOIN [User] r ON m.receiverId = r.userId
    WHERE (m.senderId = :userId1 AND m.receiverId = :userId2)
       OR (m.senderId = :userId2 AND m.receiverId = :userId1)
    ORDER BY m.createdAt DESC
    OFFSET :offset ROWS
    FETCH NEXT :limit ROWS ONLY
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ChatMessage
    WHERE (senderId = :userId1 AND receiverId = :userId2)
       OR (senderId = :userId2 AND receiverId = :userId1)
  `;
  
  const items = await executeQuery<ChatMessage[]>(query, { userId1, userId2, offset, limit });
  const countResult = await executeQuery<[{ total: number }]>(countQuery, { userId1, userId2 });
  
  return {
    items,
    totalItems: countResult[0]?.total || 0
  };
};

/**
 * Get recent conversations for a user
 */
export const getRecentConversations = async (userId: number): Promise<any[]> => {
  const query = `
    WITH LatestMessages AS (
      SELECT 
        CASE 
          WHEN senderId = :userId THEN receiverId 
          ELSE senderId 
        END as otherUserId,
        MAX(createdAt) as lastMessageTime
      FROM ChatMessage
      WHERE senderId = :userId OR receiverId = :userId
      GROUP BY CASE WHEN senderId = :userId THEN receiverId ELSE senderId END
    )
    SELECT 
      lm.otherUserId,
      u.fullName as otherUserName,
      u.role as otherUserRole,
      lm.lastMessageTime,
      (SELECT TOP 1 content FROM ChatMessage 
       WHERE (senderId = :userId AND receiverId = lm.otherUserId) 
          OR (senderId = lm.otherUserId AND receiverId = :userId)
       ORDER BY createdAt DESC) as lastMessage,
      (SELECT COUNT(*) FROM ChatMessage 
       WHERE senderId = lm.otherUserId AND receiverId = :userId AND isRead = 0) as unreadCount
    FROM LatestMessages lm
    JOIN [User] u ON lm.otherUserId = u.userId
    ORDER BY lm.lastMessageTime DESC
  `;
  
  return await executeQuery<any[]>(query, { userId });
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId: number, userId: number): Promise<void> => {
  const query = `
    UPDATE ChatMessage
    SET isRead = 1, readAt = GETDATE()
    WHERE messageId = :messageId
      AND receiverId = :userId
      AND isRead = 0
  `;
  
  await executeQuery(query, { messageId, userId }, QueryTypes.UPDATE);
};

/**
 * Mark all messages from a sender as read
 */
export const markConversationAsRead = async (userId: number, senderId: number): Promise<void> => {
  const query = `
    UPDATE ChatMessage
    SET isRead = 1, readAt = GETDATE()
    WHERE receiverId = :userId
      AND senderId = :senderId
      AND isRead = 0
  `;
  
  await executeQuery(query, { userId, senderId }, QueryTypes.UPDATE);
};

/**
 * Get unread message count for a user
 */
export const getUnreadCount = async (userId: number): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count
    FROM ChatMessage
    WHERE receiverId = :userId
      AND isRead = 0
  `;
  
  const result = await executeQuery<[{ count: number }]>(query, { userId });
  return result[0]?.count || 0;
};

/**
 * Get messages by schedule
 */
export const getMessagesBySchedule = async (scheduleId: number): Promise<ChatMessage[]> => {
  const query = `
    SELECT m.*,
           s.fullName as senderName,
           r.fullName as receiverName
    FROM ChatMessage m
    JOIN [User] s ON m.senderId = s.userId
    JOIN [User] r ON m.receiverId = r.userId
    WHERE m.scheduleId = :scheduleId
    ORDER BY m.createdAt ASC
  `;
  
  return await executeQuery<ChatMessage[]>(query, { scheduleId });
};

// ============ Notification Management ============

/**
 * Create notification
 */
export const createNotification = async (data: CreateNotificationDTO): Promise<Notification> => {
  const dataJson = data.data ? JSON.stringify(data.data) : null;
  
  const insertQuery = `
    INSERT INTO Notification (userId, type, title, message, data, isRead, createdAt)
    OUTPUT INSERTED.*
    VALUES (:userId, :type, :title, :message, :data, 0, GETDATE())
  `;
  
  const result = await executeQuery<Notification[]>(insertQuery, {
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    data: dataJson
  }, QueryTypes.INSERT);
  
  return result[0];
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (notificationId: number): Promise<Notification | null> => {
  const query = `
    SELECT *
    FROM Notification
    WHERE notificationId = :notificationId
  `;
  
  const result = await executeQuery<Notification[]>(query, { notificationId });
  return result.length > 0 ? result[0] : null;
};

/**
 * Get notifications for a user
 */
export const getNotificationsByUser = async (
  userId: number,
  isRead?: boolean,
  page: number = 1,
  limit: number = 20
): Promise<{ items: Notification[]; totalItems: number }> => {
  const offset = (page - 1) * limit;
  
  let whereClause = 'WHERE userId = :userId';
  const params: Record<string, any> = { userId, offset, limit };
  
  if (isRead !== undefined) {
    whereClause += ' AND isRead = :isRead';
    params.isRead = isRead ? 1 : 0;
  }
  
  const query = `
    SELECT *
    FROM Notification
    ${whereClause}
    ORDER BY createdAt DESC
    OFFSET :offset ROWS
    FETCH NEXT :limit ROWS ONLY
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Notification
    ${whereClause}
  `;
  
  const items = await executeQuery<Notification[]>(query, params);
  const countResult = await executeQuery<[{ total: number }]>(countQuery, params);
  
  return {
    items,
    totalItems: countResult[0]?.total || 0
  };
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  const query = `
    UPDATE Notification
    SET isRead = 1, readAt = GETDATE()
    WHERE notificationId = :notificationId
  `;
  
  await executeQuery(query, { notificationId }, QueryTypes.UPDATE);
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: number): Promise<void> => {
  const query = `
    UPDATE Notification
    SET isRead = 1, readAt = GETDATE()
    WHERE userId = :userId
      AND isRead = 0
  `;
  
  await executeQuery(query, { userId }, QueryTypes.UPDATE);
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: number): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count
    FROM Notification
    WHERE userId = :userId
      AND isRead = 0
  `;
  
  const result = await executeQuery<[{ count: number }]>(query, { userId });
  return result[0]?.count || 0;
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  const query = `
    DELETE FROM Notification
    WHERE notificationId = :notificationId
  `;
  
  await executeQuery(query, { notificationId }, QueryTypes.DELETE);
};

/**
 * Delete old notifications (cleanup)
 */
export const deleteOldNotifications = async (daysOld: number = 30): Promise<void> => {
  const query = `
    DELETE FROM Notification
    WHERE createdAt < DATEADD(day, -:daysOld, GETDATE())
      AND isRead = 1
  `;
  
  await executeQuery(query, { daysOld }, QueryTypes.DELETE);
};
