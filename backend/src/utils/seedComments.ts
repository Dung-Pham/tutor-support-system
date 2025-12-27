/**
 * Script to seed fake comments for a post
 * Usage: npm run seed:comments -- --postId=<postId> --count=<number>
 */

import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../config/sqlserver.js";
import {
  PostComment,
  ReplyComment,
  PostHeader,
  User,
} from "../models/sql/index.js";

// Sample Vietnamese comments for education platform
const sampleComments = [
  "Bài viết rất hay và bổ ích! Cảm ơn bạn đã chia sẻ.",
  "Mình đang gặp vấn đề tương tự, bài viết này giúp ích nhiều quá.",
  "Có thể giải thích thêm phần này được không ạ?",
  "Tuyệt vời! Mình đã áp dụng và thành công rồi.",
  "Bạn có thể cho mình xin tài liệu tham khảo không?",
  "Cảm ơn bạn, mình học được nhiều điều từ bài này.",
  "Phần code rất rõ ràng và dễ hiểu.",
  "Mình nghĩ nên thêm ví dụ thực tế sẽ hay hơn.",
  "Đây chính là cái mình đang tìm kiếm!",
  "Bài viết chi tiết quá, bookmark lại để đọc sau.",
  "Có ai gặp lỗi giống mình không nhỉ?",
  "Mình làm theo hướng dẫn nhưng bị lỗi, giúp mình với!",
  "Perfect! Exactly what I needed.",
  "Giải thích rất dễ hiểu, phù hợp cho người mới học.",
  "Mình đã share cho bạn bè rồi, hay quá!",
  "Bạn có thể làm thêm phần nâng cao được không?",
  "Cảm ơn thầy/cô đã chia sẻ kiến thức.",
  "Mình có một câu hỏi: Làm sao để optimize hơn?",
  "Bài viết này giải quyết được vấn đề mình gặp phải tuần trước.",
  "Rất hữu ích! Mong bạn ra thêm nhiều bài như này.",
];

const sampleReplies = [
  "Cảm ơn bạn đã phản hồi!",
  "Mình đồng ý với ý kiến này.",
  "Bạn có thể thử cách này xem sao.",
  "Đúng rồi, mình cũng nghĩ vậy.",
  "Để mình giải thích thêm cho bạn nhé.",
  "Cảm ơn bạn, mình đã hiểu rồi!",
  "À, mình hiểu ý bạn rồi.",
  "Hay quá, cảm ơn bạn nhiều!",
];

async function seedComments() {
  try {
    // Parse arguments
    const args = process.argv.slice(2);
    let postId = "";
    let commentCount = 10;
    let replyCount = 3; // replies per comment

    for (const arg of args) {
      if (arg.startsWith("--postId=")) {
        postId = arg.split("=")[1];
      } else if (arg.startsWith("--count=")) {
        commentCount = parseInt(arg.split("=")[1], 10);
      } else if (arg.startsWith("--replies=")) {
        replyCount = parseInt(arg.split("=")[1], 10);
      }
    }

    if (!postId) {
      console.error("❌ Please provide --postId=<postId>");
      console.log(
        "Usage: npm run seed:comments -- --postId=<id> --count=10 --replies=3"
      );
      process.exit(1);
    }

    console.log(`🚀 Seeding ${commentCount} comments for post ${postId}...`);

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Check if post exists
    const post = await PostHeader.findByPk(postId);
    if (!post) {
      console.error(`❌ Post not found: ${postId}`);
      process.exit(1);
    }
    console.log(`📝 Found post: "${post.title}"`);

    // Get all users to randomly assign as comment authors
    const users = await User.findAll({
      attributes: ["id", "displayName"],
    });

    if (users.length === 0) {
      console.error("❌ No users found in database");
      process.exit(1);
    }
    console.log(`👥 Found ${users.length} users`);

    // Create comments
    let totalComments = 0;
    let totalReplies = 0;

    for (let i = 0; i < commentCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomContent =
        sampleComments[Math.floor(Math.random() * sampleComments.length)];

      const comment = await PostComment.create({
        postId,
        userId: randomUser.id,
        content: randomContent,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time within last 7 days
      });

      totalComments++;
      console.log(
        `  💬 Comment ${i + 1}: "${randomContent.substring(0, 30)}..." by ${
          randomUser.displayName
        }`
      );

      // Create random replies for this comment
      const repliesForThisComment = Math.floor(
        Math.random() * (replyCount + 1)
      );
      for (let j = 0; j < repliesForThisComment; j++) {
        const replyUser = users[Math.floor(Math.random() * users.length)];
        const replyContent =
          sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

        await ReplyComment.create({
          commentId: comment.id,
          userId: replyUser.id,
          content: replyContent,
          createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
        });

        totalReplies++;
      }

      // Update reply count for comment
      if (repliesForThisComment > 0) {
        await comment.update({ replyCount: repliesForThisComment });
      }
    }

    // Update post comment count
    await post.update({ commentCount: post.commentCount + totalComments });

    console.log("\n✅ Seeding completed!");
    console.log(
      `   📊 Created ${totalComments} comments and ${totalReplies} replies`
    );
    console.log(
      `   📝 Post "${post.title}" now has ${
        post.commentCount + totalComments
      } comments`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding comments:", error);
    process.exit(1);
  }
}

seedComments();
