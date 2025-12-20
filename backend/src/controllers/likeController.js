/**
 * File: src/controllers/likeController.js
 * Mục đích: Controller cho Like feature (like post, comment, reply)
 */

import PostLike from "../models/PostLike.js";
import CommentLike from "../models/CommentLike.js";
import ReplyCommentLike from "../models/ReplyCommentLike.js";
import Post from "../models/Post.js";
import NewsComment from "../models/PostComment.js";
import ReplyComment from "../models/ReplyComment.js";

/**
 * Like/Unlike bài viết (toggle)
 * POST /api/posts/:id/like
 */
export const togglePostLike = async (req, res) => {
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

    // Chạy song song: kiểm tra post + kiểm tra đã like
    const [post, existingLike] = await Promise.all([
      Post.findById(postId).select("status likeCount").lean(),
      PostLike.findOne({ postId, userId }).select("_id").lean(),
    ]);

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

    if (existingLike) {
      // Unlike: xóa like và giảm count song song
      const [, updatedPost] = await Promise.all([
        PostLike.deleteOne({ _id: existingLike._id }),
        Post.findByIdAndUpdate(
          postId,
          { $inc: { likeCount: -1 } },
          { new: true, select: "likeCount" }
        ).lean(),
      ]);

      return res.json({
        success: true,
        message: "Đã bỏ thích bài viết",
        data: { liked: false, likeCount: updatedPost.likeCount },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Like: tạo like và tăng count song song
      const [, updatedPost] = await Promise.all([
        PostLike.create({ postId, userId }),
        Post.findByIdAndUpdate(
          postId,
          { $inc: { likeCount: 1 } },
          { new: true, select: "likeCount" }
        ).lean(),
      ]);

      return res.json({
        success: true,
        message: "Đã thích bài viết",
        data: { liked: true, likeCount: updatedPost.likeCount },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle post like error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thao tác like",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Kiểm tra user đã like bài viết chưa
 * GET /api/posts/:id/like
 */
export const checkPostLike = async (req, res) => {
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

    // Chỉ cần check exists, không cần fetch document
    const exists = await PostLike.exists({ postId, userId });

    res.json({
      success: true,
      data: { liked: !!exists },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check post like error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy danh sách user đã like bài viết
 * GET /api/posts/:id/likes?page=1&limit=20
 */
export const getPostLikes = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Chạy song song: lấy data + đếm total
    const [likes, total] = await Promise.all([
      PostLike.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "displayName avatarUrl")
        .lean(),
      PostLike.countDocuments({ postId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
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
    console.error("Get post likes error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách like",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Like/Unlike comment (toggle)
 * POST /api/comments/:commentId/like
 */
export const toggleCommentLike = async (req, res) => {
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

    // Chạy song song: kiểm tra comment + kiểm tra đã like
    const [comment, existingLike] = await Promise.all([
      NewsComment.findById(commentId).select("status like_count").lean(),
      CommentLike.findOne({ comment_like_id: commentId, account_id: userId })
        .select("_id")
        .lean(),
    ]);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (existingLike) {
      // Unlike: xóa like và giảm count song song
      const [, updatedComment] = await Promise.all([
        CommentLike.deleteOne({ _id: existingLike._id }),
        NewsComment.findByIdAndUpdate(
          commentId,
          { $inc: { like_count: -1 } },
          { new: true, select: "like_count" }
        ).lean(),
      ]);

      return res.json({
        success: true,
        message: "Đã bỏ thích comment",
        data: { liked: false, likeCount: updatedComment.like_count },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Like: tạo like và tăng count song song
      const [, updatedComment] = await Promise.all([
        CommentLike.create({ comment_like_id: commentId, account_id: userId }),
        NewsComment.findByIdAndUpdate(
          commentId,
          { $inc: { like_count: 1 } },
          { new: true, select: "like_count" }
        ).lean(),
      ]);

      return res.json({
        success: true,
        message: "Đã thích comment",
        data: { liked: true, likeCount: updatedComment.like_count },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thao tác like",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Kiểm tra user đã like comment chưa
 * GET /api/comments/:commentId/like
 */
export const checkCommentLike = async (req, res) => {
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

    // Chỉ cần check exists, không cần fetch document
    const exists = await CommentLike.exists({
      comment_like_id: commentId,
      account_id: userId,
    });

    res.json({
      success: true,
      data: { liked: !!exists },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check comment like error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Like/Unlike reply (toggle)
 * POST /api/replies/:replyId/like
 */
export const toggleReplyLike = async (req, res) => {
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

    // Chạy song song: kiểm tra reply + kiểm tra đã like
    const [reply, existingLike] = await Promise.all([
      ReplyComment.findById(replyId).select("status like_count").lean(),
      ReplyCommentLike.findOne({ reply_like_id: replyId, account_id: userId })
        .select("_id")
        .lean(),
    ]);

    if (!reply || reply.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Reply không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (existingLike) {
      // Unlike: xóa like và giảm count song song
      const [, updatedReply] = await Promise.all([
        ReplyCommentLike.deleteOne({ _id: existingLike._id }),
        ReplyComment.findByIdAndUpdate(
          replyId,
          { $inc: { like_count: -1 } },
          { new: true, select: "like_count" }
        ).lean(),
      ]);

      return res.json({
        success: true,
        message: "Đã bỏ thích reply",
        data: { liked: false, likeCount: updatedReply.like_count },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Like: tạo like và tăng count song song
      const [, updatedReply] = await Promise.all([
        ReplyCommentLike.create({ reply_like_id: replyId, account_id: userId }),
        ReplyComment.findByIdAndUpdate(
          replyId,
          { $inc: { like_count: 1 } },
          { new: true, select: "like_count" }
        ).lean(),
      ]);

      return res.json({
        success: true,
        message: "Đã thích reply",
        data: { liked: true, likeCount: updatedReply.like_count },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Toggle reply like error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thao tác like",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Kiểm tra user đã like reply chưa
 * GET /api/replies/:replyId/like
 */
export const checkReplyLike = async (req, res) => {
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

    // Chỉ cần check exists, không cần fetch document
    const exists = await ReplyCommentLike.exists({
      reply_like_id: replyId,
      account_id: userId,
    });

    res.json({
      success: true,
      data: { liked: !!exists },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check reply like error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra like",
      timestamp: new Date().toISOString(),
    });
  }
};
