/**
 * File: postController.ts
 * Má»¥c Ä‘Ã­ch: Controller cho Post/Blog feature (SQL Server + MongoDB)
 * PostHeader: SQL Server
 * PostDetail: MongoDB (contentJson)
 */

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

// Táº¡o bÃ i viáº¿t má»›i
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
        message: "TiÃªu Ä‘á» vÃ  ná»™i dung lÃ  báº¯t buá»™c",
      });
    }

    // Create PostHeader in SQL Server
    postHeader = await PostHeader.create({
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

// Láº¥y danh sÃ¡ch bÃ i viáº¿t Ä‘Ã£ approve (cÃ´ng khai)
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
      message: "Láº¥y danh sÃ¡ch bÃ i viáº¿t thÃ nh cÃ´ng",
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
      message: "Lá»—i khi láº¥y danh sÃ¡ch bÃ i viáº¿t",
    });
  }
};

// Láº¥y danh sÃ¡ch bÃ i viáº¿t chá» duyá»‡t (admin only)
export const getPendingPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chá»‰ admin cÃ³ thá»ƒ xem bÃ i viáº¿t chá» duyá»‡t",
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
      message: "Láº¥y danh sÃ¡ch bÃ i viáº¿t chá» duyá»‡t",
      data: posts,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get pending posts error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khi láº¥y danh sÃ¡ch bÃ i viáº¿t chá» duyá»‡t",
    });
  }
};

// Láº¥y danh sÃ¡ch bÃ i viáº¿t bá»‹ reject (admin only)
export const getRejectedPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chá»‰ admin cÃ³ thá»ƒ xem bÃ i viáº¿t bá»‹ reject",
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
      message: "Láº¥y danh sÃ¡ch bÃ i viáº¿t bá»‹ reject",
      data: posts,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get rejected posts error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khi láº¥y danh sÃ¡ch bÃ i viáº¿t bá»‹ reject",
    });
  }
};

// Láº¥y chi tiáº¿t má»™t bÃ i viáº¿t
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
      return res.status(404).json(formatError("BÃ i viáº¿t khÃ´ng tá»“n táº¡i"));
    }

    // Increment view count
    await post.increment("viewCount");

    // Get content from MongoDB
    const postDetail = await PostDetail.findOne({ postHeaderId: id }).lean();

    return res.json({
      success: true,
      message: "Láº¥y chi tiáº¿t bÃ i viáº¿t",
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
      message: "Lá»—i khi láº¥y chi tiáº¿t bÃ i viáº¿t",
    });
  }
};

// Láº¥y bÃ i viáº¿t cá»§a user hiá»‡n táº¡i
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
      message: "Láº¥y danh sÃ¡ch bÃ i viáº¿t cá»§a báº¡n",
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
      message: "Lá»—i khi láº¥y danh sÃ¡ch bÃ i viáº¿t",
    });
  }
};

// Cáº­p nháº­t bÃ i viáº¿t
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
        message: "BÃ i viáº¿t khÃ´ng tá»“n táº¡i",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Báº¡n khÃ´ng cÃ³ quyá»n chá»‰nh sá»­a bÃ i viáº¿t nÃ y",
      });
    }

    if (!["draft", "pending"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message:
          post.status === "approved"
            ? "KhÃ´ng thá»ƒ chá»‰nh sá»­a bÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t"
            : "KhÃ´ng thá»ƒ chá»‰nh sá»­a bÃ i viáº¿t tá»« chá»‘i",
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
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t",
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
      message: "Lá»—i cáº­p nháº­t bÃ i viáº¿t",
    });
  }
};

// XÃ³a bÃ i viáº¿t (soft delete)
export const deletePost = async (
  req: AuthRequest & { params: PostParams; body: DeletePostBody },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json(formatError("Unauthorized"));

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "BÃ i viáº¿t khÃ´ng tá»“n táº¡i",
      });
    }

    if (post.authorId !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Báº¡n khÃ´ng cÃ³ quyá»n xÃ³a bÃ i viáº¿t nÃ y",
      });
    }

    // Soft delete - chá»‰ Ä‘á»•i status thÃ nh deleted
    await post.update({
      status: "deleted",
      deletedBy: userId,
      deletedAt: new Date(),
      deleteReason: reason || null,
    });

    return res.json({
      success: true,
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c xÃ³a",
    });
  } catch (error) {
    console.error("Delete post error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i xÃ³a bÃ i viáº¿t",
    });
  }
};

// Láº¥y danh sÃ¡ch bÃ i viáº¿t Ä‘Ã£ xÃ³a (admin only)
export const getDeletedPosts = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
): Promise<Response> => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chá»‰ admin cÃ³ thá»ƒ xem bÃ i viáº¿t Ä‘Ã£ xÃ³a",
      });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where: { status: "deleted" },
      include: [
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
      order: [["deletedAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "Láº¥y danh sÃ¡ch bÃ i viáº¿t Ä‘Ã£ xÃ³a",
      data: posts,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get deleted posts error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khi láº¥y danh sÃ¡ch bÃ i viáº¿t Ä‘Ã£ xÃ³a",
    });
  }
};

// KhÃ´i phá»¥c bÃ i viáº¿t Ä‘Ã£ xÃ³a (admin only)
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
        message: "Chá»‰ admin cÃ³ thá»ƒ khÃ´i phá»¥c bÃ i viáº¿t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "BÃ i viáº¿t khÃ´ng tá»“n táº¡i",
      });
    }

    if (post.status !== "deleted") {
      return res.status(400).json({
        success: false,
        message: "BÃ i viáº¿t nÃ y chÆ°a bá»‹ xÃ³a",
      });
    }

    // KhÃ´i phá»¥c vá» tráº¡ng thÃ¡i approved
    await post.update({
      status: "approved",
      deletedBy: null,
      deletedAt: null,
      deleteReason: null,
    });

    return res.json({
      success: true,
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c khÃ´i phá»¥c",
    });
  } catch (error) {
    console.error("Restore post error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i khÃ´i phá»¥c bÃ i viáº¿t",
    });
  }
};

// XÃ³a vÄ©nh viá»…n bÃ i viáº¿t (admin only)
export const hardDeletePost = async (
  req: AuthRequest & { params: PostParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chá»‰ admin cÃ³ thá»ƒ xÃ³a vÄ©nh viá»…n bÃ i viáº¿t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "BÃ i viáº¿t khÃ´ng tá»“n táº¡i",
      });
    }

    // XÃ³a PostDetail trÆ°á»›c (MongoDB) - náº¿u fail thÃ¬ PostHeader váº«n cÃ²n
    await PostDetail.deleteOne({ postHeaderId: id });

    // Sau Ä‘Ã³ xÃ³a PostHeader (SQL Server)
    await post.destroy();

    return res.json({
      success: true,
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c xÃ³a vÄ©nh viá»…n",
    });
  } catch (error) {
    console.error("Hard delete post error", error);
    return res.status(500).json({
      success: false,
      message: "Lá»—i xÃ³a vÄ©nh viá»…n bÃ i viáº¿t",
    });
  }
};

// Duyá»‡t bÃ i viáº¿t (admin only)
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
        message: "Chá»‰ admin cÃ³ thá»ƒ duyá»‡t bÃ i viáº¿t",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "BÃ i viáº¿t khÃ´ng tá»“n táº¡i",
      });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chá»‰ cÃ³ thá»ƒ duyá»‡t bÃ i viáº¿t chá» duyá»‡t",
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
      message: "Lá»—i duyá»‡t bÃ i viáº¿t",
    });
  }
};

// Tá»« chá»‘i bÃ i viáº¿t (admin only)
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
        message: "Chá»‰ admin cÃ³ thá»ƒ tá»« chá»‘i bÃ i viáº¿t",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lÃ²ng nháº­p lÃ½ do tá»« chá»‘i",
      });
    }

    const post = await PostHeader.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "BÃ i viáº¿t khÃ´ng tá»“n táº¡i",
      });
    }

    if (!["pending", "approved"].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: "Chá»‰ cÃ³ thá»ƒ tá»« chá»‘i bÃ i viáº¿t chá» duyá»‡t hoáº·c Ä‘Ã£ duyá»‡t",
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
      message: "BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c tá»« chá»‘i",
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
      message: "Lá»—i tá»« chá»‘i bÃ i viáº¿t",
    });
  }
};
