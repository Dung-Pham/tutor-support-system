/**
 * File: database/queries/chatQueries.ts
 * Purpose: Database queries for Chat and Messaging
 */

import dbConnection from '../connection';
import { ChatMessage } from '../../types';

/**
 * Send a chat message
 * @param data Message data
 * @returns Promise<ChatMessage>
 */
export const sendMessage = async (data: {
  senderId: number;
  receiverId: number;
  message: string;
  relatedScheduleId?: number;
}): Promise<ChatMessage> => {
  const query = `
    INSERT INTO ChatMessage (
      senderId, receiverId, message, relatedScheduleId,
      sentAt, isRead, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @senderId, @receiverId, @message, @relatedScheduleId,
      GETDATE(), 0, GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<ChatMessage>(query, {
    senderId: data.senderId,
    receiverId: data.receiverId,
    message: data.message,
    relatedScheduleId: data.relatedScheduleId || null,
  });

  return result.recordset[0];
};

/**
 * Get recent conversations for a user
 * @param userId User ID
 * @param limit Limit
 * @returns Promise<Array>
 */
export const getRecentConversations = async (
  userId: number,
  limit: number = 20
): Promise<
  Array<{
    otherUserId: number;
    otherUserName: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
  }>
> => {
  const query = `
    WITH LatestMessages AS (
      SELECT 
        CASE 
          WHEN senderId = @userId THEN receiverId 
          ELSE senderId 
        END as otherUserId,
        message as lastMessage,
        sentAt as lastMessageTime,
        ROW_NUMBER() OVER (
          PARTITION BY CASE 
            WHEN senderId = @userId THEN receiverId 
            ELSE senderId 
          END 
          ORDER BY sentAt DESC
        ) as rn
      FROM ChatMessage
      WHERE senderId = @userId OR receiverId = @userId
    ),
    UnreadCounts AS (
      SELECT 
        senderId as otherUserId,
        COUNT(*) as unreadCount
      FROM ChatMessage
      WHERE receiverId = @userId AND isRead = 0
      GROUP BY senderId
    )
    SELECT TOP (@limit)
      lm.otherUserId,
      u.name as otherUserName,
      lm.lastMessage,
      lm.lastMessageTime,
      ISNULL(uc.unreadCount, 0) as unreadCount
    FROM LatestMessages lm
    LEFT JOIN [User] u ON lm.otherUserId = u.id
    LEFT JOIN UnreadCounts uc ON lm.otherUserId = uc.otherUserId
    WHERE lm.rn = 1
    ORDER BY lm.lastMessageTime DESC
  `;

  const result = await dbConnection.query<{
    otherUserId: number;
    otherUserName: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
  }>(query, { userId, limit });

  return result.recordset;
};

/**
 * Get messages in a conversation
 * @param userId User ID
 * @param otherUserId Other user ID
 * @param limit Limit
 * @param offset Offset
 * @returns Promise<{messages: ChatMessage[], total: number}>
 */
export const getConversationMessages = async (
  userId: number,
  otherUserId: number,
  limit: number = 50,
  offset: number = 0
): Promise<{ messages: ChatMessage[]; total: number }> => {
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ChatMessage
    WHERE (senderId = @userId AND receiverId = @otherUserId)
       OR (senderId = @otherUserId AND receiverId = @userId)
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, {
    userId,
    otherUserId,
  });
  const total = countResult.recordset[0].total;

  // Get messages
  const query = `
    SELECT cm.*,
           u1.name as senderName,
           u2.name as receiverName
    FROM ChatMessage cm
    LEFT JOIN [User] u1 ON cm.senderId = u1.id
    LEFT JOIN [User] u2 ON cm.receiverId = u2.id
    WHERE (cm.senderId = @userId AND cm.receiverId = @otherUserId)
       OR (cm.senderId = @otherUserId AND cm.receiverId = @userId)
    ORDER BY cm.sentAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const result = await dbConnection.query<ChatMessage>(query, {
    userId,
    otherUserId,
    limit,
    offset,
  });

  return {
    messages: result.recordset.reverse(), // Reverse to show oldest first
    total,
  };
};

/**
 * Mark message as read
 * @param messageId Message ID
 * @param userId User ID (must be receiver)
 * @returns Promise<boolean>
 */
export const markMessageAsRead = async (messageId: number, userId: number): Promise<boolean> => {
  const query = `
    UPDATE ChatMessage
    SET isRead = 1, readAt = GETDATE(), updatedAt = GETDATE()
    WHERE id = @messageId AND receiverId = @userId
  `;

  const result = await dbConnection.query(query, { messageId, userId });
  return result.rowsAffected[0] > 0;
};

/**
 * Mark all messages from a user as read
 * @param userId Current user ID
 * @param senderId Sender ID
 * @returns Promise<number> Number of messages marked as read
 */
export const markAllMessagesAsRead = async (
  userId: number,
  senderId: number
): Promise<number> => {
  const query = `
    UPDATE ChatMessage
    SET isRead = 1, readAt = GETDATE(), updatedAt = GETDATE()
    WHERE receiverId = @userId AND senderId = @senderId AND isRead = 0
  `;

  const result = await dbConnection.query(query, { userId, senderId });
  return result.rowsAffected[0];
};

/**
 * Get unread message count
 * @param userId User ID
 * @returns Promise<number>
 */
export const getUnreadMessageCount = async (userId: number): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count
    FROM ChatMessage
    WHERE receiverId = @userId AND isRead = 0
  `;

  const result = await dbConnection.query<{ count: number }>(query, { userId });
  return result.recordset[0].count;
};

/**
 * Delete message
 * @param messageId Message ID
 * @param userId User ID (must be sender)
 * @returns Promise<boolean>
 */
export const deleteMessage = async (messageId: number, userId: number): Promise<boolean> => {
  const query = `
    DELETE FROM ChatMessage
    WHERE id = @messageId AND senderId = @userId
  `;

  const result = await dbConnection.query(query, { messageId, userId });
  return result.rowsAffected[0] > 0;
};

/**
 * Search messages
 * @param userId User ID
 * @param searchTerm Search term
 * @param limit Limit
 * @returns Promise<ChatMessage[]>
 */
export const searchMessages = async (
  userId: number,
  searchTerm: string,
  limit: number = 20
): Promise<ChatMessage[]> => {
  const query = `
    SELECT TOP (@limit) cm.*,
           u1.name as senderName,
           u2.name as receiverName
    FROM ChatMessage cm
    LEFT JOIN [User] u1 ON cm.senderId = u1.id
    LEFT JOIN [User] u2 ON cm.receiverId = u2.id
    WHERE (cm.senderId = @userId OR cm.receiverId = @userId)
      AND cm.message LIKE @searchTerm
    ORDER BY cm.sentAt DESC
  `;

  const result = await dbConnection.query<ChatMessage>(query, {
    userId,
    searchTerm: `%${searchTerm}%`,
    limit,
  });

  return result.recordset;
};
