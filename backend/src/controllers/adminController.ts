// Admin Controller - SQL Server

import { Response } from "express";
import { User, PostHeader, PostComment } from "../models/sql/index.js";
import { PostDetail } from "../models/mongo/index.js";
import { AuthRequest } from "../types/common.js";
import { UserRole } from "../types/user.js";
import { Op, fn, col, literal } from "sequelize";

// Attribute mappings for UserAccount table
const USER_ATTRS_AVATAR: ([string, string] | string)[] = [
  ["user_id", "id"],
  ["name", "displayName"],
  ["avatar_url", "avatarUrl"],
];
const USER_ATTRS_EMAIL: ([string, string] | string)[] = [
  ["user_id", "id"],
  ["name", "displayName"],
  ["avatar_url", "avatarUrl"],
  "email",
];
const USER_ATTRS_BASIC: [string, string][] = [
  ["user_id", "id"],
  ["name", "displayName"],
];

interface StatsRequest extends AuthRequest {
  query: Record<string, never>;
}

interface UsersQuery {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface PostsQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface IdParams {
  id: string;
}

interface UpdateUserBody {
  role?: UserRole;
  isActive?: boolean;
  bio?: string;
}

// Láº¥y thá»‘ng kÃª tá»•ng quan cho Dashboard
export const getStats = async (
  req: StatsRequest,
  res: Response
): Promise<Response> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalPosts,
      totalComments,
      newUsersThisMonth,
      newUsersLastMonth,
      postsThisMonth,
      postsLastMonth,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      recentUsers,
      recentPosts,
      usersByRole,
    ] = await Promise.all([
      User.count(),
      PostHeader.count({ where: { status: { [Op.ne]: "draft" } } }),
      PostComment.count(),
      User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      User.count({
        where: {
          createdAt: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth },
        },
      }),
      PostHeader.count({
        where: {
          createdAt: { [Op.gte]: startOfMonth },
          status: { [Op.ne]: "draft" },
        },
      }),
      PostHeader.count({
        where: {
          createdAt: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth },
          status: { [Op.ne]: "draft" },
        },
      }),
      PostHeader.count({ where: { status: "pending" } }),
      PostHeader.count({ where: { status: "approved" } }),
      PostHeader.count({ where: { status: "rejected" } }),
      User.findAll({
        attributes: [
          "id",
          "displayName",
          "email",
          "avatarUrl",
          "role",
          "createdAt",
          "isActive",
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      PostHeader.findAll({
        where: { status: { [Op.ne]: "draft" } },
        attributes: ["id", "title", "status", "createdAt", "viewCount"],
        include: [
          {
            model: User,
            as: "author",
            attributes: USER_ATTRS_AVATAR,
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      User.findAll({
        attributes: ["role", [fn("COUNT", col("user_id")), "count"]],
        group: ["role"],
        raw: true,
      }),
    ]);

    const userGrowth =
      newUsersLastMonth > 0
        ? Math.round(
            ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
          )
        : newUsersThisMonth > 0
        ? 100
        : 0;

    const postGrowth =
      postsLastMonth > 0
        ? Math.round(((postsThisMonth - postsLastMonth) / postsLastMonth) * 100)
        : postsThisMonth > 0
        ? 100
        : 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalComments,
        newUsersThisMonth,
        postsThisMonth,
        userGrowth,
        postGrowth,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        usersByRole,
        recentUsers,
        recentPosts,
      },
    });
  } catch (error) {
    console.error("Error in getStats", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Láº¥y danh sÃ¡ch users vá»›i pagination vÃ  filter
export const getUsers = async (
  req: AuthRequest & { query: UsersQuery },
  res: Response
): Promise<Response> => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      role = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { displayName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role && role !== "all") {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const orderField = sortBy === "createdAt" ? "createdAt" : sortBy;
    const order: [string, string][] = [[orderField, sortOrder.toUpperCase()]];

    const { count: total, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["hashedPassword"] },
      order,
      offset,
      limit: limitNum,
    });

    return res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in getUsers", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Láº¥y chi tiáº¿t user
export const getUserById = async (
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["hashedPassword"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [postCount, commentCount] = await Promise.all([
      PostHeader.count({ where: { authorId: id } }),
      PostComment.count({ where: { userId: id } }),
    ]);

    return res.json({
      success: true,
      data: {
        ...user.toJSON(),
        postCount,
        commentCount,
      },
    });
  } catch (error) {
    console.error("Error in getUserById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Cáº­p nháº­t thÃ´ng tin user
export const updateUser = async (
  req: AuthRequest & { params: IdParams; body: UpdateUserBody },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { role, isActive, bio } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData: Partial<UpdateUserBody> = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (bio !== undefined) updateData.bio = bio;

    await user.update(updateData);

    // Reload without password
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["hashedPassword"] },
    });

    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// XÃ³a user (soft delete)
export const deleteUser = async (
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ isActive: false });

    return res.json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error in deleteUser", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Láº¥y danh sÃ¡ch posts vá»›i pagination vÃ  filter
export const getPosts = async (
  req: AuthRequest & { query: PostsQuery },
  res: Response
): Promise<Response> => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: { [Op.ne]: "draft" } };

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const orderField = sortBy === "createdAt" ? "createdAt" : sortBy;
    const order: [string, string][] = [[orderField, sortOrder.toUpperCase()]];

    const { count: total, rows: posts } = await PostHeader.findAndCountAll({
      where,
      attributes: [
        "id",
        "title",
        "slug",
        "status",
        "createdAt",
        "viewCount",
        "approvedAt",
        "rejectedAt",
        "rejectionReason",
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: USER_ATTRS_EMAIL,
        },
        {
          model: User,
          as: "rejecter",
          attributes: USER_ATTRS_BASIC,
        },
      ],
      order,
      offset,
      limit: limitNum,
    });

    // Lấy contentJson từ MongoDB cho mỗi post
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

    return res.json({
      success: true,
      data: postsWithContent,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in getPosts", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Láº¥y chi tiáº¿t post
export const getPostById = async (
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const post = await PostHeader.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: USER_ATTRS_EMAIL,
        },
        {
          model: User,
          as: "approver",
          attributes: USER_ATTRS_BASIC,
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error in getPostById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// XÃ³a bÃ i viáº¿t (hard delete)
export const deletePost = async (
  req: AuthRequest & { params: IdParams },
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const post = await PostHeader.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Delete related comments first
    await PostComment.destroy({ where: { postId: id } });

    // Delete the post
    await post.destroy();

    return res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error in deletePost", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Lấy dữ liệu thống kê theo thời gian cho biểu đồ
export const getChartData = async (
  req: AuthRequest & { query: { days?: string } },
  res: Response
): Promise<Response> => {
  try {
    const days = parseInt(req.query.days || "30", 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Lấy số bài viết mới và user đăng ký theo ngày
    const postsData = await PostHeader.findAll({
      attributes: [
        [fn("CAST", literal("created_at AS DATE")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
        status: { [Op.ne]: "draft" },
      },
      group: [fn("CAST", literal("created_at AS DATE"))],
      order: [[fn("CAST", literal("created_at AS DATE")), "ASC"]],
      raw: true,
    });

    const usersData = await User.findAll({
      attributes: [
        [fn("CAST", literal("created_at AS DATE")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      group: [fn("CAST", literal("created_at AS DATE"))],
      order: [[fn("CAST", literal("created_at AS DATE")), "ASC"]],
      raw: true,
    });

    // Tạo mảng đầy đủ các ngày
    const dateMap: Record<string, { posts: number; users: number }> = {};
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      dateMap[dateStr] = { posts: 0, users: 0 };
    }

    // Fill dữ liệu posts
    (postsData as unknown as { date: string; count: string }[]).forEach(
      (item) => {
        const dateStr = new Date(item.date).toISOString().split("T")[0];
        if (dateMap[dateStr]) {
          dateMap[dateStr].posts = parseInt(item.count, 10);
        }
      }
    );

    // Fill dữ liệu users
    (usersData as unknown as { date: string; count: string }[]).forEach(
      (item) => {
        const dateStr = new Date(item.date).toISOString().split("T")[0];
        if (dateMap[dateStr]) {
          dateMap[dateStr].users = parseInt(item.count, 10);
        }
      }
    );

    // Chuyển thành mảng
    const chartData = Object.entries(dateMap).map(([date, data]) => ({
      date,
      posts: data.posts,
      users: data.users,
    }));

    return res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error in getChartData", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Lấy top 10 bài viết có nhiều like nhất
export const getTopPosts = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const topPosts = await PostHeader.findAll({
      where: { status: "approved" },
      attributes: [
        "id",
        "title",
        "likeCount",
        "viewCount",
        "commentCount",
        "createdAt",
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: USER_ATTRS_AVATAR,
        },
      ],
      order: [
        ["likeCount", "DESC"],
        ["viewCount", "DESC"],
      ],
      limit: 10,
    });

    return res.json({
      success: true,
      data: topPosts,
    });
  } catch (error) {
    console.error("Error in getTopPosts", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
