// Comment Controller - SQL Server

import { Response } from "express";
import {
  PostComment,
  ReplyComment,
  PostHeader,
  User,
} from "../models/sql/index.js";
import { AuthRequest } from "../types/common.js";

// Attribute mappings for UserAccount table (column_name -> alias)
const USER_ATTRS_FULL: ([string, string] | string)[] = [
  ["user_id", "id"],
  "name",
  ["avatar_url", "avatarUrl"],
  "role",
];

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

interface ReplyBody {
  content: string;
  mentionedUserId?: string;
}

// Create new comment on post
export const createComment = async (
  req: AuthRequest & { params: PostParams; body: ContentBody },
  res: Response
): Promise<Response> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot be empty",
      });
    }

    const post = await PostHeader.findByPk(postId, {
      attributes: ["id", "status", "commentCount"],
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Can only comment on approved posts",
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
    const user = await User.findByPk(userId, {
      attributes: USER_ATTRS_FULL,
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: {
        ...comment.toJSON(),
        user,
      },
    });
  } catch (error) {
    console.error("Create comment error", error);
    return res.status(500).json({
      success: false,
      message: "Error creating comment",
    });
  }
};

// Get comments of a post
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
        message: "Post not found",
      });
    }

    const { count: total, rows: comments } = await PostComment.findAndCountAll({
      where: { postId, status: "active" },
      include: [
        {
          model: User,
          as: "user",
          attributes: USER_ATTRS_FULL,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get comments error", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving comments",
    });
  }
};

// Update comment (owner only)
export const updateComment = async (
  req: AuthRequest & { params: CommentParams; body: ContentBody },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot be empty",
      });
    }

    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this comment",
      });
    }

    await comment.update({
      content: content.trim(),
      isEdited: true,
    });

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: USER_ATTRS_FULL,
    });

    return res.json({
      success: true,
      message: "Comment updated successfully",
      data: {
        ...comment.toJSON(),
        user,
      },
    });
  } catch (error) {
    console.error("Update comment error", error);
    return res.status(500).json({
      success: false,
      message: "Error updating comment",
    });
  }
};

// Delete comment (owner or admin)
export const deleteComment = async (
  req: AuthRequest & { params: CommentParams },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner = comment.userId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this comment",
      });
    }

    // Soft delete
    await comment.update({ status: "deleted" });

    // Soft delete all replies of this comment
    await ReplyComment.update({ status: "deleted" }, { where: { commentId } });

    // Decrement post comment count
    await PostHeader.decrement("commentCount", {
      where: { id: comment.postId },
    });

    return res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
};

// Create reply for comment
export const createReply = async (
  req: AuthRequest & { params: CommentParams; body: ReplyBody },
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;
    const { content, mentionedUserId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reply content cannot be empty",
      });
    }

    const comment = await PostComment.findByPk(commentId, {
      attributes: ["id", "status", "replyCount"],
    });
    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Create reply
    const reply = await ReplyComment.create({
      commentId,
      userId,
      content: content.trim(),
      mentionedUserId: mentionedUserId || null,
    });

    // Increment reply count
    await comment.increment("replyCount");

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: USER_ATTRS_FULL,
    });

    // Get mentioned user info if exists
    let mentionedUser = null;
    if (mentionedUserId) {
      mentionedUser = await User.findByPk(mentionedUserId, {
        attributes: USER_ATTRS_FULL,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: {
        ...reply.toJSON(),
        user,
        mentionedUser,
      },
    });
  } catch (error) {
    console.error("Create reply error", error);
    return res.status(500).json({
      success: false,
      message: "Error creating reply",
    });
  }
};

// Get replies of a comment
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
        message: "Comment not found",
      });
    }

    const { count: total, rows: replies } = await ReplyComment.findAndCountAll({
      where: { commentId, status: "active" },
      include: [
        {
          model: User,
          as: "user",
          attributes: USER_ATTRS_FULL,
        },
        {
          model: User,
          as: "mentionedUser",
          attributes: USER_ATTRS_FULL,
        },
      ],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "Replies retrieved successfully",
      data: replies,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get replies error", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving replies",
    });
  }
};

// Update reply (owner only)
export const updateReply = async (
  req: AuthRequest & { params: ReplyParams; body: ContentBody },
  res: Response
): Promise<Response> => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reply content cannot be empty",
      });
    }

    const reply = await ReplyComment.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    if (reply.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this reply",
      });
    }

    await reply.update({
      content: content.trim(),
      isEdited: true,
    });

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: USER_ATTRS_FULL,
    });

    return res.json({
      success: true,
      message: "Reply updated successfully",
      data: {
        ...reply.toJSON(),
        user,
      },
    });
  } catch (error) {
    console.error("Update reply error", error);
    return res.status(500).json({
      success: false,
      message: "Error updating reply",
    });
  }
};

// Delete reply (owner or admin)
export const deleteReply = async (
  req: AuthRequest & { params: ReplyParams },
  res: Response
): Promise<Response> => {
  try {
    const { replyId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const reply = await ReplyComment.findByPk(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    const isOwner = reply.userId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this reply",
      });
    }

    // Soft delete
    await reply.update({ status: "deleted" });

    // Decrement reply count on parent comment
    await PostComment.decrement("replyCount", {
      where: { id: reply.commentId },
    });

    return res.json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Delete reply error", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting reply",
    });
  }
};
