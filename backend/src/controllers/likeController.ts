/**
 * File: likeController.ts
 * Má»¥c Ä‘Ã­ch: Controller cho Like feature (SQL Server)
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

// Like/Unlike bÃ i viáº¿t (toggle)
export const togglePostLike = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lÃ²ng Ä‘Äƒng nháº­p",
        timestamp: new Date().toISOString(),
      });
    }

    const post = await PostHeader.findByPk(postId, {
      attributes: ["id", "status", "likeCount", "authorId"],
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    // Kiểm tra không thể like bài viết của chính mình
    if (post.authorId === userId) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể thích bài viết của chính mình",
        timestamp: new Date().toISOString(),
      });
    }

    if (post.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Chá»‰ cÃ³ thá»ƒ like bÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t",
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
        message: "ÄÃ£ bá» thÃ­ch bÃ i viáº¿t",
        data: { liked: false, likeCount: post.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Like
      await PostLike.create({ postId, userId });
      await post.increment("likeCount");

      return res.json({
        success: true,
        message: "ÄÃ£ thÃ­ch bÃ i viáº¿t",
        data: { liked: true, likeCount: post.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle post like error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khi thao tÃ¡c like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Kiá»ƒm tra user Ä‘Ã£ like bÃ i viáº¿t chÆ°a
export const checkPostLike = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?.id;

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
      message: "Lá»—i khi kiá»ƒm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Láº¥y danh sÃ¡ch user Ä‘Ã£ like bÃ i viáº¿t
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
      message: "Láº¥y danh sÃ¡ch like thÃ nh cÃ´ng",
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
      message: "Lá»—i khi láº¥y danh sÃ¡ch like",
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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lÃ²ng Ä‘Äƒng nháº­p",
        timestamp: new Date().toISOString(),
      });
    }

    const comment = await PostComment.findByPk(commentId, {
      attributes: ["id", "status", "likeCount"],
    });
    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment khÃ´ng tá»“n táº¡i",
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
        message: "ÄÃ£ bá» thÃ­ch comment",
        data: { liked: false, likeCount: comment.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      await CommentLike.create({ commentId, userId });
      await comment.increment("likeCount");

      return res.json({
        success: true,
        message: "ÄÃ£ thÃ­ch comment",
        data: { liked: true, likeCount: comment.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle comment like error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khi thao tÃ¡c like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Kiá»ƒm tra user Ä‘Ã£ like comment chÆ°a
export const checkCommentLike = async (
  req: AuthRequest & { params: CommentParams },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

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
      message: "Lá»—i khi kiá»ƒm tra like",
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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lÃ²ng Ä‘Äƒng nháº­p",
        timestamp: new Date().toISOString(),
      });
    }

    const reply = await ReplyComment.findByPk(replyId, {
      attributes: ["id", "status", "likeCount"],
    });
    if (!reply || reply.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Reply khÃ´ng tá»“n táº¡i",
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
        message: "ÄÃ£ bá» thÃ­ch reply",
        data: { liked: false, likeCount: reply.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      await ReplyCommentLike.create({ replyId, userId });
      await reply.increment("likeCount");

      return res.json({
        success: true,
        message: "ÄÃ£ thÃ­ch reply",
        data: { liked: true, likeCount: reply.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle reply like error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khi thao tÃ¡c like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Kiá»ƒm tra user Ä‘Ã£ like reply chÆ°a
export const checkReplyLike = async (
  req: AuthRequest & { params: ReplyParams },
  res: Response
): Promise<Response> => {
  try {
    const { replyId } = req.params;
    const userId = req.user?.id;

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
      message: "Lá»—i khi kiá»ƒm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};
