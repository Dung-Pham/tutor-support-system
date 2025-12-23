/**
 * File: commentController.ts
 * Mục đích: Controller cho Comment feature (SQL Server)
 */

import { Response } from "express";
import {
  PostComment,
  ReplyComment,
  PostHeader,
  User,
} from "../models/sql/index.js";
import { AuthRequest } from "../types/index.js";

interface PostParams {
  postId: string;
}

interface CommentParams {
  commentId: string;
}

interface ReplyParams {
  replyId: string;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface ContentBody {
  content: string;
}

// Tạo comment mới trên bài viết
export const createComment = async (
  req: AuthRequest & { params: PostParams; body: ContentBody },
  res: Response
): Promise<Response> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung comment không được để trống",
        timestamp: new Date().toISOString(),
      });
    }

    const post = await PostHeader.findByPk(postId, {
      attributes: ["id", "status", "commentCount"],
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (post.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể comment bài viết đã được duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    // Create comment
    const comment = await PostComment.create({
      postId,
      userId,
      content: content.trim(),
    });

    // Increment post comment count
    await post.increment("commentCount");

    // Get author info
    const author = await User.findByPk(userId, {
      attributes: ["id", "displayName", "avatarUrl"],
    });

    return res.status(201).json({
      success: true,
      message: "Comment đã được tạo",
      data: {
        ...comment.toJSON(),
        author,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo comment",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy danh sách comment của bài viết
export const getComments = async (
  req: AuthRequest & { params: PostParams; query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    const { postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const postExists = await PostHeader.findByPk(postId, {
      attributes: ["id"],
    });
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const { count: total, rows: comments } = await PostComment.findAndCountAll({
      where: { postId, status: "active" },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "displayName", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "Lấy danh sách comment thành công",
      data: comments,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách comment",
      timestamp: new Date().toISOString(),
    });
  }
};

// Cập nhật comment (chỉ chủ sở hữu)
export const updateComment = async (
  req: AuthRequest & { params: CommentParams; body: ContentBody },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung comment không được để trống",
        timestamp: new Date().toISOString(),
      });
    }

    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa comment này",
        timestamp: new Date().toISOString(),
      });
    }

    await comment.update({ content: content.trim() });

    return res.json({
      success: true,
      message: "Comment đã được cập nhật",
      data: comment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật comment",
      timestamp: new Date().toISOString(),
    });
  }
};

// Xóa comment (chỉ chủ sở hữu hoặc admin)
export const deleteComment = async (
  req: AuthRequest & { params: CommentParams },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const isOwner = comment.userId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa comment này",
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete
    await comment.update({ status: "deleted" });

    // Decrement post comment count
    await PostHeader.decrement("commentCount", {
      where: { id: comment.postId },
    });

    return res.json({
      success: true,
      message: "Comment đã được xóa",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa comment",
      timestamp: new Date().toISOString(),
    });
  }
};

// Tạo reply cho comment
export const createReply = async (
  req: AuthRequest & { params: CommentParams; body: ContentBody },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung reply không được để trống",
        timestamp: new Date().toISOString(),
      });
    }

    const comment = await PostComment.findByPk(commentId, {
      attributes: ["id", "status"],
    });
    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    // Create reply
    const reply = await ReplyComment.create({
      commentId,
      userId,
      content: content.trim(),
    });

    // Increment comment reply count
    await comment.increment("replyCount");

    // Get author info
    const author = await User.findByPk(userId, {
      attributes: ["id", "displayName", "avatarUrl"],
    });

    return res.status(201).json({
      success: true,
      message: "Reply đã được tạo",
      data: {
        ...reply.toJSON(),
        author,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create reply error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo reply",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy danh sách reply của comment
export const getReplies = async (
  req: AuthRequest & { params: CommentParams; query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const commentExists = await PostComment.findByPk(commentId, {
      attributes: ["id"],
    });
    if (!commentExists) {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const { count: total, rows: replies } = await ReplyComment.findAndCountAll({
      where: { commentId, status: "active" },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "displayName", "avatarUrl"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "Lấy danh sách reply thành công",
      data: replies,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get replies error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách reply",
      timestamp: new Date().toISOString(),
    });
  }
};

// Xóa reply (chỉ chủ sở hữu hoặc admin)
export const deleteReply = async (
  req: AuthRequest & { params: ReplyParams },
  res: Response
): Promise<Response> => {
  try {
    const { replyId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    const reply = await ReplyComment.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const isOwner = reply.userId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa reply này",
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete
    await reply.update({ status: "deleted" });

    // Decrement comment reply count
    await PostComment.decrement("replyCount", {
      where: { id: reply.commentId },
    });

    return res.json({
      success: true,
      message: "Reply đã được xóa",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa reply",
      timestamp: new Date().toISOString(),
    });
  }
};
