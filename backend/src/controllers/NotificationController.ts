/**
 * HTTP Request/Response Handler
 * - Gọi Service để lấy data
 * - Format response cho client
 */
import { Request, Response } from "express";
import { responseFormatter, errorFormatter } from "../utils/responseFormatter";
import NotificationService from "../service/NotificationService";
import redisConfig from "../config/redis";
import type { Notification } from "../service/NotificationService";

const redisClient = redisConfig.client;

// --- Interfaces ---

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface NotificationResponse {
  unreadCount?: number;
  notifications?: Notification[];
}
class NotificationController {
  // ✅ GET /api/notifications/unread
  static async getUnreadNotifications(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.user_id;
      // ✅ FIX: Parse limit/offset thành number
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      console.log("📥 [getUnreadNotifications]");
      console.log("  userId:", userId);
      console.log("  limit:", limit, "type:", typeof limit);
      console.log("  offset:", offset, "type:", typeof offset);

      if (!userId) {
        res.status(401).json(errorFormatter("Không được phép truy cập", 401));
        return;
      }

      // ✅ Pass limit/offset correctly
      const notifications = await NotificationService.getUnreadNotifications(
        userId,
        limit,
        offset
      );

      console.log(`✅ Found ${notifications.length} unread notifications`);

      res
        .status(200)
        .json(
          responseFormatter(
            notifications,
            "Lấy thông báo chưa đọc thành công",
            200
          )
        );
    } catch (error) {
      console.error(
        "❌ [getUnreadNotifications] Error:",
        error.message || error.toString()
      );
      res.status(500).json(errorFormatter(error.message, 500));
    }
  }

  // ✅ GET /api/notifications
  static async getAllNotifications(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.user_id;
      // ✅ FIX: Change from page/limit to limit/offset
      // Frontend send: ?limit=100&offset=0
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      console.log("📥 [getAllNotifications]");
      console.log("  userId:", userId);
      console.log("  limit:", limit, "type:", typeof limit);
      console.log("  offset:", offset, "type:", typeof offset);

      if (!userId) {
        res.status(401).json(errorFormatter("Không được phép truy cập", 401));
        return;
      }

      // ✅ Pass limit/offset correctly (NOT page/limit)
      const notifications = await NotificationService.getAllNotifications(
        userId,
        limit,
        offset
      );

      console.log(`✅ Found ${notifications.length} notifications`);
      res
        .status(200)
        .json(
          responseFormatter(
            notifications,
            "Lấy tất cả thông báo thành công",
            200
          )
        );
    } catch (error: any) {
      console.error(
        "❌ [getAllNotifications] Error:",
        error.message || error.toString()
      );
      res.status(500).json(errorFormatter(error.message, 500));
    }
  }

  // ✅ GET /api/notifications/unread-count
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;

      console.log("📥 [getUnreadCount]");
      console.log("  userId:", userId);

      if (!userId) {
        res.status(401).json(errorFormatter("Không được phép truy cập", 401));
        return;
      }
      const cacheKey = `notif:unread_count:${userId}`;

      // 1. Check Redis cache first (if available)
      if (redisClient) {
        try {
          const cachedCount = await redisClient.get(cacheKey);
          if (cachedCount !== null) {
            console.log("⚡ [getUnreadCount] From Cache");
            res
              .status(200)
              .json(
                responseFormatter(
                  { unreadCount: parseInt(cachedCount) },
                  "Lấy từ cache",
                  200
                )
              );
            return;
          }
        } catch (cacheError) {
          console.warn("⚠️ Redis cache error, skipping:", cacheError.message);
        }
      }

      //2. If no cache, fetch from Service/DB
      const count = await NotificationService.getUnreadCount(userId);

      console.log(`✅ Unread count: ${count}`);
      
      // 3. Cache the count if Redis available
      if (redisClient) {
        try {
          await redisClient.set(cacheKey, count.toString());
        } catch (cacheError) {
          console.warn("⚠️ Redis set error, skipping:", cacheError.message);
        }
      }
      
      res
        .status(200)
        .json(
          responseFormatter(
            { unreadCount: count },
            "Lấy số thông báo chưa đọc thành công",
            200
          )
        );
    } catch (error: any) {
      console.error(
        "❌ [getUnreadCount] Error:",
        error.message || error.toString()
      );
      res.status(500).json(errorFormatter(error.message, 500));
    }
  }

  // ✅ PUT /api/notifications/:notificationId/read
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      // ✅ FIX: Use notificationId from req.params
      const { notificationId } = req.params;
      const userId = req.user?.user_id;

      console.log("📝 [markAsRead]");
      console.log("  notificationId:", notificationId);
      console.log("  userId:", userId);

      if (!notificationId) {
        res.status(400).json(errorFormatter("notificationId is required", 400));
        return;
      }

      if (!userId) {
        res.status(401).json(errorFormatter("Không được phép truy cập", 401));
        return;
      }

      await NotificationService.markAsRead(notificationId, userId);

      // update redis: giảm counter đi 1 (if Redis available)
      if (redisClient) {
        try {
          const cacheKey = `notif:unread_count:${userId}`;
          const currentCount = await redisClient.get(cacheKey);
          if (currentCount && parseInt(currentCount) > 0) {
            await redisClient.decr(cacheKey);
          }
        } catch (cacheError) {
          console.warn("⚠️ Redis decr error, skipping:", cacheError.message);
        }
      }

      console.log(`✅ Marked ${notificationId} as read`);

      res.status(200).json(responseFormatter(null, "Đã đọc", 200));
    } catch (error: any) {
      console.error(
        "❌ [markAsRead] Error:",
        error.message || error.toString()
      );
      res.status(500).json(errorFormatter(error.message, 500));
    }
  }

  // ✅ PUT /api/notifications/read-all
  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;

      console.log("📝 [markAllAsRead]");
      console.log("  userId:", userId);

      if (!userId) {
        res.status(401).json(errorFormatter("Không được phép truy cập", 401));
        return;
      }

      await NotificationService.markAllAsRead(userId);

      console.log(`✅ Marked all notifications as read`);
      
      // update redis: đặt lại counter về 0 (if Redis available)
      if (redisClient) {
        try {
          await redisClient.set(`notif:unread_count:${userId}`, "0");
        } catch (cacheError) {
          console.warn("⚠️ Redis set error, skipping:", cacheError.message);
        }
      }
      
      res
        .status(200)
        .json(
          responseFormatter(null, "Đánh dấu tất cả đã đọc thành công", 200)
        );
    } catch (error: any) {
      console.error(
        "❌ [markAllAsRead] Error:",
        error.message || error.toString()
      );
      res.status(500).json(errorFormatter(error.message, 500));
    }
  }

  // ✅ DELETE /api/notifications/:id
  static async deleteNotification(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.user_id;

      console.log("🗑️ [deleteNotification]");
      console.log("  notificationId:", notificationId);
      console.log("  userId:", userId);

      if (!notificationId) {
        res
          .status(400)
          .json(errorFormatter("Notification id is required", 400));
        return;
      }

      if (!userId) {
        res.status(401).json(errorFormatter("Không được phép truy cập", 401));
        return;
      }

      await NotificationService.deleteNotification(notificationId, userId);

      console.log(`✅ Deleted notification ${notificationId}`);

      res
        .status(200)
        .json(responseFormatter(null, "Xóa thông báo thành công", 200));
    } catch (error: any) {
      console.error(
        "❌ [deleteNotification] Error:",
        error.message || error.toString()
      );
      res.status(500).json(errorFormatter(error.message, 500));
    }
  }
}

export default NotificationController;
