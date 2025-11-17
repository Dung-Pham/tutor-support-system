/**
 * File: database/queries/notificationQueries.ts
 * Purpose: Database queries for Notification management
 */

import dbConnection from '../connection';
import { Notification } from '../../types';

/**
 * Create a notification
 * @param data Notification data
 * @returns Promise<Notification>
 */
export const createNotification = async (data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
}): Promise<Notification> => {
  const query = `
    INSERT INTO Notification (
      userId, type, title, message, relatedId, relatedType,
      isRead, createdAt, updatedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @userId, @type, @title, @message, @relatedId, @relatedType,
      0, GETDATE(), GETDATE()
    )
  `;

  const result = await dbConnection.query<Notification>(query, {
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedId: data.relatedId || null,
    relatedType: data.relatedType || null,
  });

  return result.recordset[0];
};

/**
 * Get notifications for a user
 * @param userId User ID
 * @param filters Optional filters
 * @returns Promise<{notifications: Notification[], total: number}>
 */
export const getNotificationsByUser = async (
  userId: number,
  filters?: {
    isRead?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ notifications: Notification[]; total: number }> => {
  let whereConditions: string[] = ['userId = @userId'];
  const params: Record<string, any> = { userId };

  if (filters?.isRead !== undefined) {
    whereConditions.push('isRead = @isRead');
    params.isRead = filters.isRead ? 1 : 0;
  }

  if (filters?.type) {
    whereConditions.push('type = @type');
    params.type = filters.type;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM Notification
    WHERE ${whereClause}
  `;

  const countResult = await dbConnection.query<{ total: number }>(countQuery, params);
  const total = countResult.recordset[0].total;

  // Get notifications
  const query = `
    SELECT *
    FROM Notification
    WHERE ${whereClause}
    ORDER BY createdAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  params.limit = filters?.limit || 20;
  params.offset = filters?.offset || 0;

  const result = await dbConnection.query<Notification>(query, params);

  return {
    notifications: result.recordset,
    total,
  };
};

/**
 * Mark notification as read
 * @param notificationId Notification ID
 * @param userId User ID (for verification)
 * @returns Promise<Notification | null>
 */
export const markNotificationAsRead = async (
  notificationId: number,
  userId: number
): Promise<Notification | null> => {
  const query = `
    UPDATE Notification
    SET isRead = 1, readAt = GETDATE(), updatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @notificationId AND userId = @userId
  `;

  const result = await dbConnection.query<Notification>(query, { notificationId, userId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Mark all notifications as read for a user
 * @param userId User ID
 * @returns Promise<number> Number of notifications marked as read
 */
export const markAllNotificationsAsRead = async (userId: number): Promise<number> => {
  const query = `
    UPDATE Notification
    SET isRead = 1, readAt = GETDATE(), updatedAt = GETDATE()
    WHERE userId = @userId AND isRead = 0
  `;

  const result = await dbConnection.query(query, { userId });
  return result.rowsAffected[0];
};

/**
 * Get unread notification count
 * @param userId User ID
 * @returns Promise<number>
 */
export const getUnreadNotificationCount = async (userId: number): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count
    FROM Notification
    WHERE userId = @userId AND isRead = 0
  `;

  const result = await dbConnection.query<{ count: number }>(query, { userId });
  return result.recordset[0].count;
};

/**
 * Get notification by ID
 * @param notificationId Notification ID
 * @param userId User ID (for verification)
 * @returns Promise<Notification | null>
 */
export const getNotificationById = async (
  notificationId: number,
  userId: number
): Promise<Notification | null> => {
  const query = `
    SELECT *
    FROM Notification
    WHERE id = @notificationId AND userId = @userId
  `;

  const result = await dbConnection.query<Notification>(query, { notificationId, userId });
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Delete notification
 * @param notificationId Notification ID
 * @param userId User ID (for verification)
 * @returns Promise<boolean>
 */
export const deleteNotification = async (
  notificationId: number,
  userId: number
): Promise<boolean> => {
  const query = `
    DELETE FROM Notification
    WHERE id = @notificationId AND userId = @userId
  `;

  const result = await dbConnection.query(query, { notificationId, userId });
  return result.rowsAffected[0] > 0;
};

/**
 * Delete all read notifications for a user
 * @param userId User ID
 * @returns Promise<number> Number of notifications deleted
 */
export const deleteReadNotifications = async (userId: number): Promise<number> => {
  const query = `
    DELETE FROM Notification
    WHERE userId = @userId AND isRead = 1
  `;

  const result = await dbConnection.query(query, { userId });
  return result.rowsAffected[0];
};

/**
 * Create bulk notifications (for broadcasting)
 * @param notifications Array of notification data
 * @returns Promise<number> Number of notifications created
 */
export const createBulkNotifications = async (
  notifications: Array<{
    userId: number;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }>
): Promise<number> => {
  if (notifications.length === 0) return 0;

  // Build VALUES clause for bulk insert
  const values = notifications
    .map(
      (_, index) =>
        `(@userId${index}, @type${index}, @title${index}, @message${index}, @relatedId${index}, @relatedType${index}, 0, GETDATE(), GETDATE())`
    )
    .join(', ');

  const query = `
    INSERT INTO Notification (
      userId, type, title, message, relatedId, relatedType,
      isRead, createdAt, updatedAt
    )
    VALUES ${values}
  `;

  // Build parameters
  const params: Record<string, any> = {};
  notifications.forEach((notif, index) => {
    params[`userId${index}`] = notif.userId;
    params[`type${index}`] = notif.type;
    params[`title${index}`] = notif.title;
    params[`message${index}`] = notif.message;
    params[`relatedId${index}`] = notif.relatedId || null;
    params[`relatedType${index}`] = notif.relatedType || null;
  });

  const result = await dbConnection.query(query, params);
  return result.rowsAffected[0];
};
