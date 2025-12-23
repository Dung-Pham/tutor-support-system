/**
 * File: postController.ts
 * Mục đích: Controller cho Post/Blog feature (SQL Server + MongoDB)
 * PostHeader: SQL Server
 * PostDetail: MongoDB (contentJson)
 */

import { Response } from "express";
import { PostHeader, User } from "../models/sql/index.js";
import { PostDetail } from "../models/mongo/index.js";
import { createSlug } from "../utils/slug.js";
import { AuthRequest } from "../types/index.js";
import { Op } from "sequelize";

type PostStatus = "draft" | "pending" | "approved" | "rejected";

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: PostStatus;
}

interface PostParams {
  id: string;
}

interface CreatePostBody {
  title: string;
  contentJson: Record<string, unknown>;
  status?: "draft" | "pending";
}

interface UpdatePostBody {
  title?: string;
  contentJson?: Record<string, unknown>;
  status?: "draft" | "pending";
}

interface RejectPostBody {
  reason: string;
}

const formatError = (message: string) => ({
  success: false,
  message,
  timestamp: new Date().toISOString(),
});

// Helper: Extract plain text from contentJson
const extractPlainText = (contentJson: Record<string, unknown>): string => {
  const extractText = (node: Record<string, unknown>): string => {
    if (node.text) return node.text as string;
    if (node.content && Array.isArray(node.content)) {
      return node.content
        .map((child) => extractText(child as Record<string, unknown>))
        .join(" ");
    }
    return "";
  };
  return extractText(contentJson).trim();
};

// Tạo bài viết mới
export const createPost = async (
  req: AuthRequest & { body: CreatePostBody },
  res: Response
): Promise<Response> => {
  try {
    const { title, contentJson, status = "draft" } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));
    if (!title || !contentJson) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và nội dung là bắt buộc",
        timestamp: new Date().toISOString(),
      });
    }

    // Create PostHeader in SQL Server
    const postHeader = await PostHeader.create({
      title,
      slug: createSlug(title),
      authorId: userId,
      status: status === "draft" ? "draft" : "pending",
    });

    // Create PostDetail in MongoDB
    await PostDetail.create({
      postHeaderId: postHeader.id,
      contentJson,
      contentPlain: extractPlainText(contentJson),
    });

    // Get author info
    const author = await User.findByPk(userId, {
      attributes: ["id", "displayName", "avatarUrl", "role"],
    });

    return res.status(201).json({
      success: true,
      message: "Bài viết đã được tạo",
      data: {
        ...postHeader.toJSON(),
        author,
        contentJson,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tạo bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy danh sách bài viết đã approve (công khai)
export const getApprovedPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where: { status: "approved" },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "displayName", "avatarUrl", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy danh sách bài viết chờ duyệt (admin only)
export const getPendingPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể xem bài viết chờ duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "displayName", "avatarUrl", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết chờ duyệt",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy danh sách bài viết bị reject (admin only)
export const getRejectedPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể xem bài viết bị reject",
        timestamp: new Date().toISOString(),
      });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where: { status: "rejected" },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "displayName", "avatarUrl", "role"],
        },
      ],
      order: [["rejectedAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "Lấy danh sách bài viết bị reject",
      data: posts,
      page,
      limit,
      total,
      totalPages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get rejected posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết bị reject",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy chi tiết một bài viết
export const getPostDetail = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Update view count and get post
    const post = await PostHeader.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "displayName", "avatarUrl", "role"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "displayName"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json(formatError("Bài viết không tồn tại"));
    }

    // Increment view count
    await post.increment("viewCount");

    // Get content from MongoDB
    const postDetail = await PostDetail.findOne({ postHeaderId: id }).lean();

    return res.json({
      success: true,
      message: "Lấy chi tiết bài viết",
      data: {
        ...post.toJSON(),
        contentJson: postDetail?.contentJson || null,
        contentPlain: postDetail?.contentPlain || "",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get post detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy bài viết của user hiện tại
export const getMyPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const { status } = req.query;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { authorId: userId };
    if (
      status &&
      ["draft", "pending", "approved", "rejected"].includes(status)
    ) {
      where.status = status;
    }

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Cập nhật bài viết
export const updatePost = async (
  req: AuthRequest & { params: PostParams; body: UpdatePostBody },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title, contentJson, status } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (post.authorId !== userId) {
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

    // Update PostHeader
    const updateData: Partial<{
      title: string;
      slug: string;
      status: PostStatus;
    }> = {};
    if (title) {
      updateData.title = title;
      updateData.slug = createSlug(title);
    }
    if (status && ["draft", "pending"].includes(status)) {
      updateData.status = status;
    }

    await post.update(updateData);

    // Update PostDetail if contentJson provided
    if (contentJson) {
      await PostDetail.findOneAndUpdate(
        { postHeaderId: id },
        {
          contentJson,
          contentPlain: extractPlainText(contentJson),
        },
        { upsert: true }
      );
    }

    const author = await User.findByPk(userId, {
      attributes: ["id", "displayName", "avatarUrl", "role"],
    });

    return res.json({
      success: true,
      message: "Bài viết đã được cập nhật",
      data: {
        ...post.toJSON(),
        author,
        contentJson,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update post error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Xóa bài viết
export const deletePost = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (post.authorId !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bài viết này",
        timestamp: new Date().toISOString(),
      });
    }

    // Delete from both databases
    await Promise.all([
      post.destroy(),
      PostDetail.deleteOne({ postHeaderId: id }),
    ]);

    return res.json({
      success: true,
      message: "Bài viết đã được xóa",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xóa bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Duyệt bài viết (admin only)
export const approvePost = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
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

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể duyệt bài viết chờ duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    await post.update({
      status: "approved",
      approvedBy: adminId,
      approvedAt: new Date(),
    });

    const [author, approver] = await Promise.all([
      User.findByPk(post.authorId, {
        attributes: ["id", "displayName", "avatarUrl", "role"],
      }),
      User.findByPk(adminId, {
        attributes: ["id", "displayName"],
      }),
    ]);

    return res.json({
      success: true,
      message: "Bài viết đã được duyệt",
      data: {
        ...post.toJSON(),
        author,
        approver,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Approve post error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi duyệt bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};

// Từ chối bài viết (admin only)
export const rejectPost = async (
  req: AuthRequest & { params: PostParams; body: RejectPostBody },
  res: Response
): Promise<Response> => {
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

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
        timestamp: new Date().toISOString(),
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
        timestamp: new Date().toISOString(),
      });
    }

    if (!["pending", "approved"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể từ chối bài viết chờ duyệt hoặc đã duyệt",
        timestamp: new Date().toISOString(),
      });
    }

    await post.update({
      status: "rejected",
      rejectionReason: reason,
      rejectedBy: adminId,
      rejectedAt: new Date(),
    });

    const [author, rejecter] = await Promise.all([
      User.findByPk(post.authorId, {
        attributes: ["id", "displayName", "avatarUrl", "role"],
      }),
      User.findByPk(adminId, {
        attributes: ["id", "displayName"],
      }),
    ]);

    return res.json({
      success: true,
      message: "Bài viết đã được từ chối",
      data: {
        ...post.toJSON(),
        author,
        rejecter,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reject post error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi từ chối bài viết",
      timestamp: new Date().toISOString(),
    });
  }
};
