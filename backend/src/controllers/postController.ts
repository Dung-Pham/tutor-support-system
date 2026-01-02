// Post Controller - SQL Server (PostHeader) + MongoDB (PostDetail)

import { Response } from "express";
import { PostHeader, User } from "../models/sql/index.js";
import { PostDetail } from "../models/mongo/index.js";
import { createSlug } from "../utils/slug.js";
import { AuthRequest } from "../types/common.js";
import { Op } from "sequelize";

// Attribute mappings for UserAccount table (column_name -> alias)
const USER_ATTRS_FULL: [string, string][] | string[] = [
  ["user_id", "id"],
  ["name", "displayName"],
  ["avatar_url", "avatarUrl"],
  "role",
];
const USER_ATTRS_BASIC: [string, string][] = [
  ["user_id", "id"],
  ["name", "displayName"],
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
      message: "B? i viáº¿t Ä‘?£ Ä‘Æ°á»£c táº¡o",
      data: {
        ...postHeader.toJSON(),
        author,
        contentJson,
      },
    });
  } catch (error) {
    console.error("Create post error", error);

    // Rollback: X?³a PostHeader náº¿u Ä‘?£ táº¡o m?  PostDetail fail
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
      message: "Lá»—i táº¡o b? i viáº¿t",
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
      message: "L?y danh sách bài vi?t thành công",
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
      message: "L?i khi l?y danh sách bài vi?t",
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
        message: "Status không h?p l?",
      });
    }

    // Admin only check
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Ch? admin có th? xem danh sách này",
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
      pending: "L?y danh sách bài vi?t ch? duy?t",
      rejected: "L?y danh sách bài vi?t b? t? ch?i",
      deleted: "L?y danh sách bài vi?t ð? xóa",
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
      message: "L?i khi l?y danh sách bài vi?t",
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
      return res.status(404).json(formatError("Bài vi?t không t?n t?i"));
    }

    // Increment view count
    await post.increment("viewCount");

    // Get content from MongoDB
    const postDetail = await PostDetail.findOne({ postHeaderId: id }).lean();

    return res.json({
      success: true,
      message: "L?y chi ti?t bài vi?t",
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
      message: "L?i khi l?y chi ti?t bài vi?t",
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
      message: "L?y danh sách bài vi?t c?a b?n",
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
      message: "L?i khi l?y danh sách bài vi?t",
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
        message: "Bài vi?t không t?n t?i",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "B?n không có quy?n ch?nh s?a bài vi?t này",
      });
    }

    if (!["draft", "pending"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message:
          post.status === "approved"
            ? "Không th? ch?nh s?a bài vi?t ð? ðý?c duy?t"
            : "Không th? ch?nh s?a bài vi?t t? ch?i",
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
      message: "Bài vi?t ð? ðý?c c?p nh?t",
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
      message: "L?i c?p nh?t bài vi?t",
    });
  }
};

// Soft delete post (admin only) - chuy?n bài vi?t vào thùng rác ð? có th? khôi ph?c
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
        message: "Ch? admin có th? th?c hi?n soft delete",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài vi?t không t?n t?i",
      });
    }

    // Soft delete - ch? ð?i status thành deleted
    await post.update({
      status: "deleted",
      deletedBy: adminId,
      deletedAt: new Date(),
      deleteReason: reason || null,
    });

    return res.json({
      success: true,
      message: "Bài vi?t ð? ðý?c chuy?n vào thùng rác",
    });
  } catch (error) {
    console.error("Soft delete post error", error);
    return res.status(500).json({
      success: false,
      message: "L?i xóa bài vi?t",
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
        message: "Ch? admin có th? khôi ph?c bài vi?t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài vi?t không t?n t?i",
      });
    }

    if (post.status !== "deleted") {
      return res.status(400).json({
        success: false,
        message: "Bài vi?t này chýa b? xóa",
      });
    }

    // Khôi ph?c v? tr?ng thái approved
    await post.update({
      status: "approved",
      deletedBy: null,
      deletedAt: null,
      deleteReason: null,
    });

    return res.json({
      success: true,
      message: "Bài vi?t ð? ðý?c khôi ph?c",
    });
  } catch (error) {
    console.error("Restore post error", error);
    return res.status(500).json({
      success: false,
      message: "L?i khôi ph?c bài vi?t",
    });
  }
};

// Permanently delete post
// - Tutor: ch? xóa ðý?c bài c?a m?nh có status "draft" ho?c "pending"
// - Admin: xóa ðý?c t?t c?, bao g?m c? bài có status "deleted"
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
        message: "Bài vi?t không t?n t?i",
      });
    }

    const isAuthor = post.authorId === userId;

    // Ki?m tra quy?n xóa
    if (post.status === "deleted") {
      // Bài ð? b? soft delete ? ch? admin m?i ðý?c hard delete
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Ch? admin có th? xóa v?nh vi?n bài vi?t ð? xóa",
        });
      }
    } else if (["draft", "pending"].includes(post.status)) {
      // Bài draft/pending ? author ho?c admin có th? xóa
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "B?n không có quy?n xóa bài vi?t này",
        });
      }
    } else {
      // Bài approved/rejected ? ch? admin
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Ch? admin có th? xóa v?nh vi?n bài vi?t này",
        });
      }
    }

    // Delete PostDetail first (MongoDB) - if fail, PostHeader still exists
    await PostDetail.deleteOne({ postHeaderId: id });

    // Then delete PostHeader (SQL Server)
    await post.destroy();

    return res.json({
      success: true,
      message: "Bài vi?t ð? ðý?c xóa v?nh vi?n",
    });
  } catch (error) {
    console.error("Hard delete post error", error);
    return res.status(500).json({
      success: false,
      message: "L?i xóa v?nh vi?n bài vi?t",
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
        message: "Ch? admin có th? duy?t bài vi?t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài vi?t không t?n t?i",
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Ch? có th? duy?t bài vi?t ch? duy?t",
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
      message: "B? i viáº¿t Ä‘?£ Ä‘Æ°á»£c duyá»‡t",
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
      message: "L?i duy?t bài vi?t",
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
        message: "Ch? admin có th? t? ch?i bài vi?t",
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
        message: "Bài vi?t không t?n t?i",
      });
    }

    if (!["pending", "approved"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: "Ch? có th? t? ch?i bài vi?t ch? duy?t ho?c ð? duy?t",
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
      message: "Bài vi?t ð? ðý?c t? ch?i",
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
      message: "L?i t? ch?i bài vi?t",
    });
  }
};
