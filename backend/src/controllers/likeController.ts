/**
 * File: likeController.ts
 * Mục đích: Controller cho Like feature (SQL Server)
 */

import { Response } from "express";
import {
  PostLike,
  CommentLike,
  ReplyCommentLike,
  PostHeader,
  PostComment,
  ReplyComment,
  User,
} from "../models/sql/index.js";
import { AuthRequest } from "../types/common.js";

interface PostParams {
  id: string;
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

// Like/Unlike bài viết (toggle)
export const togglePostLike = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    const post = await PostHeader.findByPk(postId, {
      attributes: ["id", "status", "likeCount"],
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
        message: "Chỉ có thể like bài viết đã được duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    // Check existing like
    const existingLike = await PostLike.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement("likeCount");

      return res.json({
        success: true,
        message: "Đã bỏ thích bài viết",
        data: { liked: false, likeCount: post.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Like
      await PostLike.create({ postId, userId });
      await post.increment("likeCount");

      return res.json({
        success: true,
        message: "Đã thích bài viết",
        data: { liked: true, likeCount: post.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle post like error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thao tác like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Kiểm tra user đã like bài viết chưa
export const checkPostLike = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.json({
        success: true,
        data: { liked: false },
        timestamp: new Date().toISOString(),
      });
    }

    const exists = await PostLike.findOne({
      where: { postId, userId },
      attributes: ["id"],
    });

    return res.json({
      success: true,
      data: { liked: !!exists },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check post like error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy danh sách user đã like bài viết
export const getPostLikes = async (
  req: AuthRequest & { params: PostParams; query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    const { id: postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "20", 10));
    const offset = (page - 1) * limit;

    const { count: total, rows: likes } = await PostLike.findAndCountAll({
      where: { postId },
      include: [
        {
          model: User,
          as: "user",
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
      message: "Lấy danh sách like thành công",
      data: likes,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get post likes error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Like/Unlike comment (toggle)
export const toggleCommentLike = async (
  req: AuthRequest & { params: CommentParams },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    const comment = await PostComment.findByPk(commentId, {
      attributes: ["id", "status", "likeCount"],
    });
    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const existingLike = await CommentLike.findOne({
      where: { commentId, userId },
    });

    if (existingLike) {
      await existingLike.destroy();
      await comment.decrement("likeCount");

      return res.json({
        success: true,
        message: "Đã bỏ thích comment",
        data: { liked: false, likeCount: comment.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      await CommentLike.create({ commentId, userId });
      await comment.increment("likeCount");

      return res.json({
        success: true,
        message: "Đã thích comment",
        data: { liked: true, likeCount: comment.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle comment like error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thao tác like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Kiểm tra user đã like comment chưa
export const checkCommentLike = async (
  req: AuthRequest & { params: CommentParams },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.json({
        success: true,
        data: { liked: false },
        timestamp: new Date().toISOString(),
      });
    }

    const exists = await CommentLike.findOne({
      where: { commentId, userId },
      attributes: ["id"],
    });

    return res.json({
      success: true,
      data: { liked: !!exists },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check comment like error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Like/Unlike reply (toggle)
export const toggleReplyLike = async (
  req: AuthRequest & { params: ReplyParams },
  res: Response
): Promise<Response> => {
  try {
    const { replyId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
        timestamp: new Date().toISOString(),
      });
    }

    const reply = await ReplyComment.findByPk(replyId, {
      attributes: ["id", "status", "likeCount"],
    });
    if (!reply || reply.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Reply không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const existingLike = await ReplyCommentLike.findOne({
      where: { replyId, userId },
    });

    if (existingLike) {
      await existingLike.destroy();
      await reply.decrement("likeCount");

      return res.json({
        success: true,
        message: "Đã bỏ thích reply",
        data: { liked: false, likeCount: reply.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      await ReplyCommentLike.create({ replyId, userId });
      await reply.increment("likeCount");

      return res.json({
        success: true,
        message: "Đã thích reply",
        data: { liked: true, likeCount: reply.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle reply like error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thao tác like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Kiểm tra user đã like reply chưa
export const checkReplyLike = async (
  req: AuthRequest & { params: ReplyParams },
  res: Response
): Promise<Response> => {
  try {
    const { replyId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.json({
        success: true,
        data: { liked: false },
        timestamp: new Date().toISOString(),
      });
    }

    const exists = await ReplyCommentLike.findOne({
      where: { replyId, userId },
      attributes: ["id"],
    });

    return res.json({
      success: true,
      data: { liked: !!exists },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check reply like error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};
