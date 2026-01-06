// Post Controller - SQL Server (PostHeader) + MongoDB (PostDetail)

import { Response } from "express";
import { PostHeader, User } from "../models/sql/index.js";
import { PostDetail } from "../models/mongo/index.js";
import { createSlug } from "../utils/slug.js";
import { AuthRequest } from "../types/common.js";
import { Op } from "sequelize";

// Simple in-memory cache to prevent view count spam
// Key: `${postId}:${userId || ip}`, Value: timestamp
const viewedPosts = new Map<string, number>();
const VIEW_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewedPosts.entries()) {
    if (now - timestamp > VIEW_COOLDOWN_MS) {
      viewedPosts.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Attribute mappings for UserAccount table (column_name -> alias)
const USER_ATTRS_FULL: [string, string][] | string[] = [
  ["user_id", "id"],
  "name",
  ["avatar_url", "avatarUrl"],
  "role",
];
const USER_ATTRS_BASIC: [string, string][] | string[] = [
  ["user_id", "id"],
  "name",
];

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
      attributes: [["user_id", "id"], ["name", "displayName"], ["avatar_url", "avatarUrl"], "role"],
    });

    return res.status(201).json({
      success: true,
      message: "B?�i viết đ?� được tạo",
      data: {
        ...postHeader.toJSON(),
        author,
        contentJson,
      },
    });
  } catch (error) {
    console.error("Create post error", error);

    // Rollback: X?�a PostHeader nếu đ?� tạo m?� PostDetail fail
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
      message: "Lỗi tạo b?�i viết",
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
          attributes: [["user_id", "id"], ["name", "displayName"], ["avatar_url", "avatarUrl"], "role"],
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

    // Config theo t?ng status
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
            attributes: USER_ATTRS_FULL,
          },
        ],
      },
      rejected: {
        order: [["rejectedAt", "DESC"]],
        includes: [
          {
            model: User,
            as: "author",
            attributes: USER_ATTRS_FULL,
          },
        ],
      },
      deleted: {
        order: [["deletedAt", "DESC"]],
        includes: [
          {
            model: User,
            as: "author",
            attributes: USER_ATTRS_FULL,
          },
          {
            model: User,
            as: "deletedByUser",
            attributes: USER_ATTRS_BASIC,
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

    // L?y contentJson t? MongoDB cho m?i post
    const postIds = posts.map((p) => p.id);
    const postDetails = await PostDetail.find({
      postHeaderId: { $in: postIds },
    }).lean();

    const detailMap = new Map(postDetails.map((d) => [d.postHeaderId, d]));

    const postsWithContent = posts.map((post) => {
      const detail = detailMap.get(post.id);
      return {
        ...post.toJSON(),
        contentJson: detail?.contentJson || null,
        contentPlain: detail?.contentPlain || "",
      };
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
      data: postsWithContent,
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

    // Get post with author info
    const post = await PostHeader.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: USER_ATTRS_FULL,
        },
        {
          model: User,
          as: "approver",
          attributes: USER_ATTRS_BASIC,
        },
      ],
    });

    if (!post) {
      return res.status(404).json(formatError("Bài viết không tồn tại"));
    }

    // Only increment view count once per user/IP within cooldown period
    const viewerId = req.user?.id || req.ip || 'anonymous';
    const viewKey = `${id}:${viewerId}`;
    const lastViewed = viewedPosts.get(viewKey);
    const now = Date.now();

    if (!lastViewed || (now - lastViewed) > VIEW_COOLDOWN_MS) {
      await post.increment("viewCount");
      viewedPosts.set(viewKey, now);
    }

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
        message: "B�i vi?t kh�ng t?n t?i",
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
      attributes: USER_ATTRS_FULL,
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
        message: "Ch? admin c� th? th?c hi?n soft delete",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "B�i vi?t kh�ng t?n t?i",
      });
    }

    // Soft delete - ch? �?i status th�nh deleted
    await post.update({
      status: "deleted",
      deletedBy: adminId,
      deletedAt: new Date(),
      deleteReason: reason || null,
    });

    return res.json({
      success: true,
      message: "B�i vi?t �? ��?c chuy?n v�o th�ng r�c",
    });
  } catch (error) {
    console.error("Soft delete post error", error);
    return res.status(500).json({
      success: false,
      message: "L?i x�a b�i vi?t",
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
        message: "Ch? admin c� th? kh�i ph?c b�i vi?t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "B�i vi?t kh�ng t?n t?i",
      });
    }

    if (post.status !== "deleted") {
      return res.status(400).json({
        success: false,
        message: "B�i vi?t n�y ch�a b? x�a",
      });
    }

    // Kh�i ph?c v? tr?ng th�i approved
    await post.update({
      status: "approved",
      deletedBy: null,
      deletedAt: null,
      deleteReason: null,
    });

    return res.json({
      success: true,
      message: "B�i vi?t �? ��?c kh�i ph?c",
    });
  } catch (error) {
    console.error("Restore post error", error);
    return res.status(500).json({
      success: false,
      message: "L?i kh�i ph?c b�i vi?t",
    });
  }
};

// Permanently delete post
// - Tutor: ch? x�a ��?c b�i c?a m?nh c� status "draft" ho?c "pending"
// - Admin: x�a ��?c t?t c?, bao g?m c? b�i c� status "deleted"
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
        message: "B�i vi?t kh�ng t?n t?i",
      });
    }

    const isAuthor = post.authorId === userId;

    // Ki?m tra quy?n x�a
    if (post.status === "deleted") {
      // B�i �? b? soft delete ? ch? admin m?i ��?c hard delete
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Ch? admin c� th? x�a v?nh vi?n b�i vi?t �? x�a",
        });
      }
    } else if (["draft", "pending"].includes(post.status)) {
      // B�i draft/pending ? author ho?c admin c� th? x�a
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "B?n kh�ng c� quy?n x�a b�i vi?t n�y",
        });
      }
    } else {
      // B�i approved/rejected ? ch? admin
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Ch? admin c� th? x�a v?nh vi?n b�i vi?t n�y",
        });
      }
    }

    // Delete PostDetail first (MongoDB) - if fail, PostHeader still exists
    await PostDetail.deleteOne({ postHeaderId: id });

    // Then delete PostHeader (SQL Server)
    await post.destroy();

    return res.json({
      success: true,
      message: "B�i vi?t �? ��?c x�a v?nh vi?n",
    });
  } catch (error) {
    console.error("Hard delete post error", error);
    return res.status(500).json({
      success: false,
      message: "L?i x�a v?nh vi?n b�i vi?t",
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
        message: "Ch? admin c� th? duy?t b�i vi?t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "B�i vi?t kh�ng t?n t?i",
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Ch? c� th? duy?t b�i vi?t ch? duy?t",
      });
    }

    await post.update({
      status: "approved",
      approvedBy: adminId,
      approvedAt: new Date(),
    });

    const [author, approver] = await Promise.all([
      User.findByPk(post.authorId, {
        attributes: USER_ATTRS_FULL,
      }),
      User.findByPk(adminId, {
        attributes: USER_ATTRS_BASIC,
      }),
    ]);

    return res.json({
      success: true,
      message: "B?�i viết đ?� được duyệt",
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
      message: "L?i duy?t b�i vi?t",
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
        message: "Ch? admin c� th? t? ch?i b�i vi?t",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui l?ng nh?p l? do t? ch?i",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "B�i vi?t kh�ng t?n t?i",
      });
    }

    if (!["pending", "approved"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: "Ch? c� th? t? ch?i b�i vi?t ch? duy?t ho?c �? duy?t",
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
        attributes: USER_ATTRS_FULL,
      }),
      User.findByPk(adminId, {
        attributes: USER_ATTRS_BASIC,
      }),
    ]);

    return res.json({
      success: true,
      message: "B�i vi?t �? ��?c t? ch?i",
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
      message: "L?i t? ch?i b�i vi?t",
    });
  }
};
