// Post Controller - SQL Server (PostHeader) + MongoDB (PostDetail)

import { Response } from "express";
import { PostHeader, User } from "../models/sql/index.js";
import { PostDetail } from "../models/mongo/index.js";
import { createSlug } from "../utils/slug.js";
import { AuthRequest } from "../types/common.js";
import { Op } from "sequelize";

type PostStatus = "draft" | "pending" | "approved" | "rejected" | "deleted";

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

interface DeletePostBody {
  reason?: string;
}

const formatError = (message: string) => ({
  success: false,
  message,
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

// Helper: Generate unique slug
const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists, if so append number
  while (await PostHeader.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Create new post
export const createPost = async (
  req: AuthRequest & { body: CreatePostBody },
  res: Response
): Promise<Response> => {
  let postHeader: PostHeader | null = null;

  try {
    const { title, contentJson, status = "draft" } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));
    if (!title || !contentJson) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(title);

    // Create PostHeader in SQL Server
    postHeader = await PostHeader.create({
      title,
      slug,
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
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c táº¡o",
      data: {
        ...postHeader.toJSON(),
        author,
        contentJson,
      },
    });
  } catch (error) {
    console.error("Create post error", error);

    // Rollback: XÃ³a PostHeader náº¿u Ä‘Ã£ táº¡o mÃ  PostDetail fail
    if (postHeader) {
      try {
        await postHeader.destroy();
        console.log("Rolled back PostHeader:", postHeader.id);
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Lá»—i táº¡o bÃ i viáº¿t",
    });
  }
};

// Get approved posts (public)
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
    });
  } catch (error) {
    console.error("Get approved posts error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
    });
  }
};

// Get posts by status (admin only)
export const getPostsByStatus = async (
  req: AuthRequest & { query: PaginationQuery; params: { status: PostStatus } },
  res: Response
): Promise<Response> => {
  try {
    const { status } = req.params;

    // Validate status
    if (!["pending", "rejected", "deleted"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status không hợp lệ",
      });
    }

    // Admin only check
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể xem danh sách này",
      });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    // Config theo từng status
    const statusConfig: Record<
      string,
      { order: [string, string][]; includes: object[] }
    > = {
      pending: {
        order: [["createdAt", "DESC"]],
        includes: [
          {
            model: User,
            as: "author",
            attributes: ["id", "displayName", "avatarUrl", "role"],
          },
        ],
      },
      rejected: {
        order: [["rejectedAt", "DESC"]],
        includes: [
          {
            model: User,
            as: "author",
            attributes: ["id", "displayName", "avatarUrl", "role"],
          },
        ],
      },
      deleted: {
        order: [["deletedAt", "DESC"]],
        includes: [
          {
            model: User,
            as: "author",
            attributes: ["id", "displayName", "avatarUrl", "role"],
          },
          {
            model: User,
            as: "deletedByUser",
            attributes: ["id", "displayName"],
          },
        ],
      },
    };

    const config = statusConfig[status];

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where: { status },
      include: config.includes,
      order: config.order,
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);
    const messages: Record<string, string> = {
      pending: "Lấy danh sách bài viết chờ duyệt",
      rejected: "Lấy danh sách bài viết bị từ chối",
      deleted: "Lấy danh sách bài viết đã xóa",
    };

    return res.json({
      success: true,
      message: messages[status],
      data: posts,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get posts by status error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
    });
  }
};

// Get post detail
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
    });
  } catch (error) {
    console.error("Get post detail error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết bài viết",
    });
  }
};

// Get current user's posts
export const getMyPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;
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
    });
  } catch (error) {
    console.error("Get my posts error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
    });
  }
};

// Update post
export const updatePost = async (
  req: AuthRequest & { params: PostParams; body: UpdatePostBody },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title, contentJson, status } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa bài viết này",
      });
    }

    if (!["draft", "pending"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message:
          post.status === "approved"
            ? "Không thể chỉnh sửa bài viết đã được duyệt"
            : "Không thể chỉnh sửa bài viết từ chối",
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
    });
  } catch (error) {
    console.error("Update post error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật bài viết",
    });
  }
};

// Soft delete post (admin only) - chuyển bài viết vào thùng rác để có thể khôi phục
export const softDeletePost = async (
  req: AuthRequest & { params: PostParams; body: DeletePostBody },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể thực hiện soft delete",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    // Soft delete - chỉ đổi status thành deleted
    await post.update({
      status: "deleted",
      deletedBy: adminId,
      deletedAt: new Date(),
      deleteReason: reason || null,
    });

    return res.json({
      success: true,
      message: "Bài viết đã được chuyển vào thùng rác",
    });
  } catch (error) {
    console.error("Soft delete post error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xóa bài viết",
    });
  }
};

// Restore deleted post (admin only)
export const restorePost = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể khôi phục bài viết",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    if (post.status !== "deleted") {
      return res.status(400).json({
        success: false,
        message: "Bài viết này chưa bị xóa",
      });
    }

    // Khôi phục về trạng thái approved
    await post.update({
      status: "approved",
      deletedBy: null,
      deletedAt: null,
      deleteReason: null,
    });

    return res.json({
      success: true,
      message: "Bài viết đã được khôi phục",
    });
  } catch (error) {
    console.error("Restore post error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khôi phục bài viết",
    });
  }
};

// Permanently delete post
// - Tutor: chỉ xóa được bài của mình có status "draft" hoặc "pending"
// - Admin: xóa được tất cả, bao gồm cả bài có status "deleted"
export const hardDeletePost = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    if (!userId) {
      return res.status(401).json(formatError("Unauthorized"));
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    const isAuthor = post.authorId === userId;

    // Kiểm tra quyền xóa
    if (post.status === "deleted") {
      // Bài đã bị soft delete → chỉ admin mới được hard delete
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Chỉ admin có thể xóa vĩnh viễn bài viết đã xóa",
        });
      }
    } else if (["draft", "pending"].includes(post.status)) {
      // Bài draft/pending → author hoặc admin có thể xóa
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa bài viết này",
        });
      }
    } else {
      // Bài approved/rejected → chỉ admin
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Chỉ admin có thể xóa vĩnh viễn bài viết này",
        });
      }
    }

    // Delete PostDetail first (MongoDB) - if fail, PostHeader still exists
    await PostDetail.deleteOne({ postHeaderId: id });

    // Then delete PostHeader (SQL Server)
    await post.destroy();

    return res.json({
      success: true,
      message: "Bài viết đã được xóa vĩnh viễn",
    });
  } catch (error) {
    console.error("Hard delete post error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xóa vĩnh viễn bài viết",
    });
  }
};

// Approve post (admin only)
export const approvePost = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể duyệt bài viết",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể duyệt bài viết chờ duyệt",
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
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t",
      data: {
        ...post.toJSON(),
        author,
        approver,
      },
    });
  } catch (error) {
    console.error("Approve post error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi duyệt bài viết",
    });
  }
};

// Reject post (admin only)
export const rejectPost = async (
  req: AuthRequest & { params: PostParams; body: RejectPostBody },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin có thể từ chối bài viết",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    if (!["pending", "approved"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể từ chối bài viết chờ duyệt hoặc đã duyệt",
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
    });
  } catch (error) {
    console.error("Reject post error", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi từ chối bài viết",
    });
  }
};
