/**
 * File: src/controllers/commentController.js
 * Mục đích: Controller cho Comment feature (comment + reply)
 */

import NewsComment from "../models/PostComment.js";
import ReplyComment from "../models/ReplyComment.js";
import Post from "../models/Post.js";

/**
 * Tạo comment mới trên bài viết
 * POST /api/posts/:postId/comments
 */
export const createComment = async (req, res) => {
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

    // Kiểm tra bài viết tồn tại và đã được duyệt (chỉ select status)
    const post = await Post.findById(postId).select("status").lean();
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

    // Tạo comment
    const comment = new NewsComment({
      postId,
      accountId: userId,
      comment_content: content.trim(),
    });

    // Lưu comment và tăng commentCount song song
    await Promise.all([
      comment.save(),
      Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
    ]);

    // Populate author info (đã có trong middleware nhưng call thêm để đảm bảo)
    await comment.populate("accountId", "displayName avatarUrl");

    res.status(201).json({
      success: true,
      message: "Comment đã được tạo",
      data: comment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo comment",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy danh sách comment của bài viết
 * GET /api/posts/:postId/comments?page=1&limit=10
 */
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Kiểm tra bài viết tồn tại (chỉ cần check exists)
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const filter = { postId, status: "active" };
    const [comments, total] = await Promise.all([
      NewsComment.find(filter)
        .sort({ create_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsComment.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);

    res.json({
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
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách comment",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Cập nhật comment (chỉ chủ sở hữu)
 * PATCH /api/comments/:commentId
 */
export const updateComment = async (req, res) => {
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

    const comment = await NewsComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (comment.accountId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa comment này",
        timestamp: new Date().toISOString(),
      });
    }

    comment.comment_content = content.trim();
    await comment.save();

    res.json({
      success: true,
      message: "Comment đã được cập nhật",
      data: comment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật comment",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Xóa comment (chỉ chủ sở hữu hoặc admin)
 * DELETE /api/comments/:commentId
 */
export const deleteComment = async (req, res) => {
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

    const comment = await NewsComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const isOwner = comment.accountId._id.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa comment này",
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete
    comment.status = "deleted";
    await comment.save();

    // Giảm commentCount của bài viết
    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -1 },
    });

    res.json({
      success: true,
      message: "Comment đã được xóa",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa comment",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Tạo reply cho comment
 * POST /api/comments/:commentId/replies
 */
export const createReply = async (req, res) => {
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

    // Kiểm tra comment tồn tại (chỉ select status)
    const comment = await NewsComment.findById(commentId)
      .select("status")
      .lean();
    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    // Tạo reply
    const reply = new ReplyComment({
      comment_id: commentId,
      accountId: userId,
      reply_comment_content: content.trim(),
    });

    // Lưu reply và tăng reply_count song song
    await Promise.all([
      reply.save(),
      NewsComment.findByIdAndUpdate(commentId, { $inc: { reply_count: 1 } }),
    ]);

    // Populate author info
    await reply.populate("accountId", "displayName avatarUrl");

    res.status(201).json({
      success: true,
      message: "Reply đã được tạo",
      data: reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo reply",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy danh sách reply của comment
 * GET /api/comments/:commentId/replies?page=1&limit=10
 */
export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Kiểm tra comment tồn tại (chỉ cần check exists)
    const commentExists = await NewsComment.exists({ _id: commentId });
    if (!commentExists) {
      return res.status(404).json({
        success: false,
        message: "Comment không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const filter = { comment_id: commentId, status: "active" };
    const [replies, total] = await Promise.all([
      ReplyComment.find(filter)
        .sort({ create_at: 1 }) // Replies sắp xếp từ cũ đến mới
        .skip(skip)
        .limit(limit)
        .lean(),
      ReplyComment.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);

    res.json({
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
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách reply",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Xóa reply (chỉ chủ sở hữu hoặc admin)
 * DELETE /api/replies/:replyId
 */
export const deleteReply = async (req, res) => {
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

    const reply = await ReplyComment.findById(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    const isOwner = reply.accountId._id.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa reply này",
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete
    reply.status = "deleted";
    await reply.save();

    // Giảm reply_count của comment
    await NewsComment.findByIdAndUpdate(reply.comment_id, {
      $inc: { reply_count: -1 },
    });

    res.json({
      success: true,
      message: "Reply đã được xóa",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa reply",
      timestamp: new Date().toISOString(),
    });
  }
};
