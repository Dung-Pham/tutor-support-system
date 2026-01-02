// Like Controller - SQL Server

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

// Attribute mappings for UserAccount table (column_name -> alias)
const USER_ATTRS_BASIC: [string, string][] = [
  ["user_id", "id"],
  ["name", "displayName"],
  ["avatar_url", "avatarUrl"],
];

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

// Like/Unlike b?†i vi·∫øt (toggle)
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
        message: "Vui l?≤ng ƒëƒÉng nh·∫≠p",
        timestamp: new Date().toISOString(),
      });
    }

    const post = await PostHeader.findByPk(postId, {
      attributes: ["id", "status", "likeCount", "authorId"],
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "B‡i vi?t khÙng t?n t?i",
        timestamp: new Date().toISOString(),
      });
    }

    // Ki?m tra khÙng th? like b‡i vi?t c?a chÌnh m?nh
    if (post.authorId === userId) {
      return res.status(400).json({
        success: false,
        message: "B?n khÙng th? thÌch b‡i vi?t c?a chÌnh m?nh",
        timestamp: new Date().toISOString(),
      });
    }

    if (post.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Ch·ªâ c?≥ th·ªÉ like b?†i vi·∫øt ƒë?£ ƒë∆∞·ª£c duy·ªát",
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
        message: "ƒê?£ b·ªè th?≠ch b?†i vi·∫øt",
        data: { liked: false, likeCount: post.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Like
      await PostLike.create({ postId, userId });
      await post.increment("likeCount");

      return res.json({
        success: true,
        message: "ƒê?£ th?≠ch b?†i vi·∫øt",
        data: { liked: true, likeCount: post.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle post like error", error);
    return res.status(500).json({
      success: false,
      message: "L·ªói khi thao t?°c like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Ki·ªÉm tra user ƒë?£ like b?†i vi·∫øt ch∆∞a
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
      message: "L·ªói khi ki·ªÉm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};

// L·∫•y danh s?°ch user ƒë?£ like b?†i vi·∫øt
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
          attributes: USER_ATTRS_BASIC,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "L·∫•y danh s?°ch like th?†nh c?¥ng",
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
      message: "L·ªói khi l·∫•y danh s?°ch like",
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
        message: "Vui l?≤ng ƒëƒÉng nh·∫≠p",
        timestamp: new Date().toISOString(),
      });
    }

    const comment = await PostComment.findByPk(commentId, {
      attributes: ["id", "status", "likeCount"],
    });
    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment kh?¥ng t·ªìn t·∫°i",
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
        message: "ƒê?£ b·ªè th?≠ch comment",
        data: { liked: false, likeCount: comment.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      await CommentLike.create({ commentId, userId });
      await comment.increment("likeCount");

      return res.json({
        success: true,
        message: "ƒê?£ th?≠ch comment",
        data: { liked: true, likeCount: comment.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle comment like error", error);
    return res.status(500).json({
      success: false,
      message: "L·ªói khi thao t?°c like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Ki·ªÉm tra user ƒë?£ like comment ch∆∞a
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
      message: "L·ªói khi ki·ªÉm tra like",
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
        message: "Vui l?≤ng ƒëƒÉng nh·∫≠p",
        timestamp: new Date().toISOString(),
      });
    }

    const reply = await ReplyComment.findByPk(replyId, {
      attributes: ["id", "status", "likeCount"],
    });
    if (!reply || reply.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Reply kh?¥ng t·ªìn t·∫°i",
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
        message: "ƒê?£ b·ªè th?≠ch reply",
        data: { liked: false, likeCount: reply.likeCount - 1 },
        timestamp: new Date().toISOString(),
      });
    } else {
      await ReplyCommentLike.create({ replyId, userId });
      await reply.increment("likeCount");

      return res.json({
        success: true,
        message: "ƒê?£ th?≠ch reply",
        data: { liked: true, likeCount: reply.likeCount + 1 },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle reply like error", error);
    return res.status(500).json({
      success: false,
      message: "L·ªói khi thao t?°c like",
      timestamp: new Date().toISOString(),
    });
  }
};

// Ki·ªÉm tra user ƒë?£ like reply ch∆∞a
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
      message: "L·ªói khi ki·ªÉm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};
