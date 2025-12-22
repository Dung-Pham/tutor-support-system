/**
 * File: hybrid-controller-example.js
 * Mục đích: Ví dụ Controller làm việc với cả MongoDB và SQL Server
 *
 * Kiến trúc Hybrid Database:
 * - SQL Server (Sequelize): User, Session, PostLike, CommentLike
 * - MongoDB (Mongoose): Post, Message, Conversation, Comment
 */

// ============================================
// IMPORTS
// ============================================

// MongoDB Models (Mongoose)
import Post from "../models/Post.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// SQL Server Models (Sequelize) - Ví dụ sau khi migrate
// import { User, PostLike, Session } from "../models/sql/index.js";

// Sequelize instance for transactions
import { sequelize } from "../config/sqlserver.js";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper: Lấy thông tin User từ SQL Server bằng ID
 * Vì không thể dùng populate() giữa 2 database
 */
const getUserById = async (userId) => {
  // Giả sử User đã được migrate sang SQL Server
  // const user = await User.findByPk(userId, {
  //   attributes: ['id', 'displayName', 'avatarUrl', 'role']
  // });
  // return user;

  // Placeholder - hiện tại vẫn dùng MongoDB
  const User = (await import("../models/User.js")).default;
  return await User.findById(userId)
    .select("displayName avatarUrl role")
    .lean();
};

/**
 * Helper: Lấy nhiều Users từ SQL Server
 * Dùng khi cần populate nhiều users cùng lúc
 */
const getUsersByIds = async (userIds) => {
  // SQL Server version:
  // const users = await User.findAll({
  //   where: { id: userIds },
  //   attributes: ['id', 'displayName', 'avatarUrl', 'role']
  // });
  // return users.reduce((map, user) => {
  //   map[user.id] = user;
  //   return map;
  // }, {});

  // Placeholder - hiện tại vẫn dùng MongoDB
  const User = (await import("../models/User.js")).default;
  const users = await User.find({ _id: { $in: userIds } })
    .select("displayName avatarUrl role")
    .lean();

  return users.reduce((map, user) => {
    map[user._id.toString()] = user;
    return map;
  }, {});
};

// ============================================
// CONTROLLER EXAMPLES
// ============================================

/**
 * VÍ DỤ 1: Lấy bài viết với thông tin author từ SQL Server
 *
 * Flow:
 * 1. Query Post từ MongoDB
 * 2. Query User (author) từ SQL Server
 * 3. Merge data thủ công
 */
export const getPostWithAuthor = async (req, res) => {
  try {
    const { postId } = req.params;

    // Step 1: Lấy Post từ MongoDB (KHÔNG populate author)
    const post = await Post.findById(postId).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    // Step 2: Lấy Author từ SQL Server
    const author = await getUserById(post.author);

    // Step 3: Merge data thủ công
    const postWithAuthor = {
      ...post,
      author: author || { displayName: "Unknown", avatarUrl: null },
    };

    return res.status(200).json({
      success: true,
      message: "Lấy bài viết thành công",
      data: postWithAuthor,
    });
  } catch (error) {
    console.error("Error in getPostWithAuthor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * VÍ DỤ 2: Lấy danh sách bài viết với authors (batch query)
 *
 * Tối ưu: Thay vì query N lần cho N posts,
 * chỉ query 1 lần để lấy tất cả unique authors
 */
export const getPostsWithAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Step 1: Lấy Posts từ MongoDB
    const [posts, total] = await Promise.all([
      Post.find({ status: "approved" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments({ status: "approved" }),
    ]);

    // Step 2: Lấy unique author IDs
    const authorIds = [...new Set(posts.map((p) => p.author.toString()))];

    // Step 3: Batch query authors từ SQL Server (1 query thay vì N queries)
    const authorsMap = await getUsersByIds(authorIds);

    // Step 4: Merge authors vào posts
    const postsWithAuthors = posts.map((post) => ({
      ...post,
      author: authorsMap[post.author.toString()] || {
        displayName: "Unknown",
        avatarUrl: null,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết thành công",
      data: postsWithAuthors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getPostsWithAuthors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * VÍ DỤ 3: Like bài viết với Transaction
 *
 * Trường hợp: PostLike ở SQL Server, Post.likeCount ở MongoDB
 * Cần đảm bảo consistency giữa 2 database
 */
export const likePost = async (req, res) => {
  // Bắt đầu SQL Server transaction
  const sqlTransaction = await sequelize.transaction();

  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    // Step 1: Kiểm tra post tồn tại (MongoDB)
    const post = await Post.findById(postId);
    if (!post) {
      await sqlTransaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    // Step 2: Kiểm tra đã like chưa (SQL Server)
    // const existingLike = await PostLike.findOne({
    //   where: { userId, postId },
    //   transaction: sqlTransaction,
    // });

    // if (existingLike) {
    //   await sqlTransaction.rollback();
    //   return res.status(400).json({
    //     success: false,
    //     message: "Bạn đã like bài viết này rồi",
    //   });
    // }

    // Step 3: Tạo like record (SQL Server)
    // await PostLike.create(
    //   { userId, postId, createdAt: new Date() },
    //   { transaction: sqlTransaction }
    // );

    // Step 4: Tăng likeCount trong Post (MongoDB)
    // Lưu ý: MongoDB không hỗ trợ 2-phase commit với SQL Server
    // Nên cần có cơ chế compensation nếu fail
    await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

    // Step 5: Commit SQL Server transaction
    await sqlTransaction.commit();

    return res.status(200).json({
      success: true,
      message: "Like bài viết thành công",
      data: {
        postId,
        likeCount: post.likeCount + 1,
      },
    });
  } catch (error) {
    // Rollback SQL Server transaction nếu có lỗi
    await sqlTransaction.rollback();

    console.error("Error in likePost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * VÍ DỤ 4: Unlike bài viết với Compensation Pattern
 *
 * Khi không có distributed transaction, dùng compensation
 * để rollback thủ công khi có lỗi
 */
export const unlikePost = async (req, res) => {
  const sqlTransaction = await sequelize.transaction();
  let mongoUpdated = false; // Flag để track MongoDB changes

  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    // Step 1: Xóa like record (SQL Server)
    // const deleted = await PostLike.destroy({
    //   where: { userId, postId },
    //   transaction: sqlTransaction,
    // });

    // if (deleted === 0) {
    //   await sqlTransaction.rollback();
    //   return res.status(400).json({
    //     success: false,
    //     message: "Bạn chưa like bài viết này",
    //   });
    // }

    // Step 2: Giảm likeCount trong Post (MongoDB)
    await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
    mongoUpdated = true;

    // Step 3: Commit SQL Server transaction
    await sqlTransaction.commit();

    return res.status(200).json({
      success: true,
      message: "Unlike bài viết thành công",
    });
  } catch (error) {
    // Rollback SQL Server
    await sqlTransaction.rollback();

    // Compensation: Rollback MongoDB changes nếu đã update
    if (mongoUpdated) {
      try {
        await Post.findByIdAndUpdate(req.params.postId, {
          $inc: { likeCount: 1 },
        });
        console.log("MongoDB compensation successful");
      } catch (compensationError) {
        console.error("MongoDB compensation failed:", compensationError);
        // Log để xử lý thủ công sau
      }
    }

    console.error("Error in unlikePost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * VÍ DỤ 5: Đăng ký User mới
 *
 * User được lưu ở SQL Server
 * Có thể cần tạo conversation mặc định ở MongoDB
 */
export const registerUser = async (req, res) => {
  const sqlTransaction = await sequelize.transaction();

  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Step 1: Tạo User ở SQL Server
    // const user = await User.create({
    //   email,
    //   hashedPassword: await bcrypt.hash(password, 10),
    //   firstName,
    //   lastName,
    //   displayName: `${firstName} ${lastName}`,
    //   role,
    // }, { transaction: sqlTransaction });

    // Step 2: Tạo welcome conversation với admin (MongoDB)
    // const adminId = "admin_user_id";
    // const conversation = new Conversation({
    //   type: "direct",
    //   participants: [
    //     { userId: user.id },
    //     { userId: adminId },
    //   ],
    // });
    // await conversation.save();

    // Step 3: Tạo welcome message (MongoDB)
    // const message = new Message({
    //   conversationId: conversation._id,
    //   senderId: adminId,
    //   content: `Chào mừng ${firstName} đến với hệ thống!`,
    // });
    // await message.save();

    // Step 4: Commit
    await sqlTransaction.commit();

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      // data: { user },
    });
  } catch (error) {
    await sqlTransaction.rollback();

    // Compensation cho MongoDB nếu cần
    // ...

    console.error("Error in registerUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * VÍ DỤ 6: Lấy profile với statistics
 *
 * Kết hợp data từ cả 2 database
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Parallel queries đến cả 2 database
    const [user, postStats, conversationCount] = await Promise.all([
      // User từ SQL Server
      getUserById(userId),

      // Post statistics từ MongoDB
      Post.aggregate([
        { $match: { author: userId } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: "$likeCount" },
            totalViews: { $sum: "$viewCount" },
          },
        },
      ]),

      // Conversation count từ MongoDB
      Conversation.countDocuments({
        "participants.userId": userId,
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    const stats = postStats[0] || {
      totalPosts: 0,
      totalLikes: 0,
      totalViews: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Lấy profile thành công",
      data: {
        ...user,
        statistics: {
          posts: stats.totalPosts,
          likes: stats.totalLikes,
          views: stats.totalViews,
          conversations: conversationCount,
        },
      },
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// SERVICE LAYER EXAMPLE (Recommended Pattern)
// ============================================

/**
 * Khuyến nghị: Tách logic ra Service Layer
 * để dễ quản lý và test
 */

// userService.js
export const UserService = {
  async findById(id) {
    // SQL Server query
    // return await User.findByPk(id);
  },

  async findByIds(ids) {
    // SQL Server batch query
    // return await User.findAll({ where: { id: ids } });
  },

  async create(data, transaction) {
    // SQL Server create with transaction
    // return await User.create(data, { transaction });
  },
};

// postService.js
export const PostService = {
  async findById(id) {
    return await Post.findById(id).lean();
  },

  async findWithAuthor(id) {
    const post = await this.findById(id);
    if (!post) return null;

    const author = await UserService.findById(post.author);
    return { ...post, author };
  },
};

// ============================================
// BEST PRACTICES SUMMARY
// ============================================

/**
 * BEST PRACTICES khi làm việc với Hybrid Database:
 *
 * 1. KHÔNG dùng populate() giữa 2 database
 *    → Tự query và merge thủ công
 *
 * 2. BATCH QUERIES thay vì N+1 queries
 *    → Lấy unique IDs, query 1 lần, map kết quả
 *
 * 3. PARALLEL QUERIES khi data độc lập
 *    → Dùng Promise.all() để query cả 2 DB cùng lúc
 *
 * 4. TRANSACTIONS cần xử lý riêng
 *    → SQL Server có transaction
 *    → MongoDB dùng session (replica set) hoặc compensation
 *
 * 5. COMPENSATION PATTERN cho distributed operations
 *    → Track changes, rollback thủ công khi fail
 *
 * 6. SERVICE LAYER để tách biệt logic
 *    → Dễ maintain, test, và switch database
 *
 * 7. ID FORMAT cần nhất quán
 *    → MongoDB: ObjectId (string 24 chars)
 *    → SQL Server: UUID hoặc INT
 *    → Lưu reference dạng string trong cả 2
 */
