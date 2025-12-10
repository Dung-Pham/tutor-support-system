/**
 * File: src/controllers/postController.js
 * Mục đích: Controller cho Post/Blog feature
 */

import Post from "../models/Post.js";

/**
 * Tạo bài viết mới (draft hoặc pending)
 * POST /api/posts
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, status = "draft" } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));
    if (!title || !content)
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và nội dung là bắt buộc",
        timestamp: new Date().toISOString(),
      });

    const post = new Post({
      title,
      content,
      status: status === "draft" ? "draft" : "pending",
      author: userId,
    });

    await post.save();
    await post.populate("author", "displayName avatarUrl role");
    res.status(201).json({
      success: true,
      message: "Bài viết đã được tạo",
      data: post,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy danh sách bài viết đã approve (công khai)
 * GET /api/posts?page=1&limit=10
 */
export const getApprovedPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Post.countDocuments({ status: "approved" });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: "Lấy danh sách bài viết thành công",
      data: posts,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get approved posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy danh sách bài viết chờ duyệt (admin only)
 * GET /api/posts/pending?page=1&limit=10
 */
export const getPendingPosts = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể xem bài viết chờ duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Post.countDocuments({ status: "pending" });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: "Lấy danh sách bài viết chờ duyệt",
      data: posts,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get pending posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết chờ duyệt",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy chi tiết một bài viết
 * GET /api/posts/:id
 */
export const getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post)
      return res.status(404).json(formatError("Bài viết không tồn tại"));

    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    res.json({
      success: true,
      message: "Lấy chi tiết bài viết",
      data: post,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get post detail error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lấy bài viết của tutor hiện tại (với filter status)
 * GET /api/posts/my?status=draft&page=1&limit=10
 */
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const { status } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { author: userId };
    if (
      status &&
      ["draft", "pending", "approved", "rejected"].includes(status)
    ) {
      filter.status = status;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: "Lấy danh sách bài viết của bạn",
      data: posts,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Cập nhật bài viết (chỉ draft hoặc pending)
 * PATCH /api/posts/:id
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });

    // So sánh author._id nếu author là object, hoặc author nếu là string
    const authorId =
      typeof post.author === "object" ? post.author._id : post.author;

    if (authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa bài viết này",
        timestamp: new Date().toISOString(),
      });
    }

    if (!["draft", "pending"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message:
          post.status === "approved"
            ? "Không thể chỉnh sửa bài viết đã được duyệt"
            : "Không thể chỉnh sửa bài viết từ chối",
        timestamp: new Date().toISOString(),
      });
    }

    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    await post.populate("author", "displayName avatarUrl role");

    res.json({
      success: true,
      message: "Bài viết đã được cập nhật",
      data: post,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Xóa bài viết (chỉ draft hoặc pending)
 * DELETE /api/posts/:id
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });

    // So sánh author._id nếu author là object, hoặc author nếu là string
    const authorId =
      typeof post.author === "object" ? post.author._id : post.author;

    if (authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bài viết này",
        timestamp: new Date().toISOString(),
      });
    }

    if (!["draft", "pending"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message:
          post.status === "approved"
            ? "Không thể xóa bài viết đã được duyệt"
            : "Không thể xóa bài viết từ chối",
        timestamp: new Date().toISOString(),
      });
    }

    await Post.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Bài viết đã được xóa",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Duyệt bài viết (admin only)
 * PATCH /api/posts/:id/approve
 */
export const approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể duyệt bài viết",
        timestamp: new Date().toISOString(),
      });
    }

    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể duyệt bài viết chờ duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    post.status = "approved";
    post.approvedBy = adminId;
    post.approvedAt = new Date();

    await post.save();
    await post.populate("author", "displayName avatarUrl role");
    await post.populate("approvedBy", "displayName");

    res.json({
      success: true,
      message: "Bài viết đã được duyệt",
      data: post,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Approve post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi duyệt bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Từ chối bài viết (admin only)
 * PATCH /api/posts/:id/reject
 */
export const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?._id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể từ chối bài viết",
        timestamp: new Date().toISOString(),
      });
    }

    if (!reason)
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
        timestamp: new Date().toISOString(),
      });

    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể từ chối bài viết chờ duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    post.status = "rejected";
    post.rejectionReason = reason;
    post.approvedBy = adminId;
    post.approvedAt = new Date();

    await post.save();
    await post.populate("author", "displayName avatarUrl role");

    res.json({
      success: true,
      message: "Bài viết đã được từ chối",
      data: post,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reject post error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi từ chối bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};
