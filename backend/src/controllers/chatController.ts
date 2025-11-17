/**
 * File: controllers/chatController.ts
 * Mục đích: Handle HTTP requests cho chat & notifications
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';
import * as chatService from '../services/chatService';

// Chat
export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    const message = await chatService.sendMessage(req.user!.userId, req.body);
    return res.status(201).json({ success: true, message: 'Message sent', data: message } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to send message', error: error.message } as ApiResponse);
  }
};

export const getConversation = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const otherUserId = parseInt(req.params.otherUserId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const result = await chatService.getConversation(req.user!.userId, otherUserId, page, limit);
    return res.status(200).json({ success: true, message: 'Conversation retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get conversation', error: error.message } as ApiResponse);
  }
};

export const getRecentConversations = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const conversations = await chatService.getRecentConversations(req.user!.userId);
    return res.status(200).json({ success: true, message: 'Recent conversations retrieved', data: conversations } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get conversations', error: error.message } as ApiResponse);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const messageId = parseInt(req.params.messageId);
    await chatService.markMessageAsRead(messageId, req.user!.userId);
    return res.status(200).json({ success: true, message: 'Message marked as read' } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to mark message as read', error: error.message } as ApiResponse);
  }
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const count = await chatService.getUnreadCount(req.user!.userId);
    return res.status(200).json({ success: true, message: 'Unread count retrieved', data: { count } } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get unread count', error: error.message } as ApiResponse);
  }
};

// Notifications
export const createNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', error: errors.array() } as ApiResponse);
    }
    const notification = await chatService.createNotification(req.body);
    return res.status(201).json({ success: true, message: 'Notification created', data: notification } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create notification', error: error.message } as ApiResponse);
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await chatService.getNotificationsByUser(req.user!.userId, isRead, page, limit);
    return res.status(200).json({ success: true, message: 'Notifications retrieved', data: result } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message } as ApiResponse);
  }
};

export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    await chatService.markNotificationAsRead(notificationId);
    return res.status(200).json({ success: true, message: 'Notification marked as read' } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message } as ApiResponse);
  }
};

export const getUnreadNotificationCount = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const count = await chatService.getUnreadNotificationCount(req.user!.userId);
    return res.status(200).json({ success: true, message: 'Unread count retrieved', data: { count } } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get unread count', error: error.message } as ApiResponse);
  }
};
