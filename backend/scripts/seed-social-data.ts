// Seed Social Data - Posts, Comments, Conversations, Messages
// Run with: npx tsx scripts/seed-social-data.ts

import "dotenv/config";
import { sequelize } from "../src/config/sqlserver.js";
import connectMongoDB from "../src/config/mongodb.js";
import {
  User,
  PostHeader,
  PostComment,
  ReplyComment,
  Conversation,
  Participant,
  PostLike,
  CommentLike,
} from "../src/models/sql/index.js";
import { PostDetail, Message } from "../src/models/mongo/index.js";
import { v4 as uuidv4 } from "uuid";

// Sample data
const postTitles = [
  "Hướng dẫn giải bài tập Toán lớp 12",
  "Phương pháp học tiếng Anh hiệu quả",
  "Chia sẻ kinh nghiệm ôn thi đại học",
  "Tips học lập trình cho người mới bắt đầu",
  "Cách quản lý thời gian khi đi học thêm",
  "Review sách hay cho học sinh THPT",
  "Kinh nghiệm thi IELTS 7.0+",
  "Phương pháp ghi nhớ công thức Hóa học",
  "Hướng dẫn viết văn nghị luận xã hội",
  "Chia sẻ tài liệu ôn thi Vật Lý",
  "Cách học Sinh học hiệu quả",
  "Tips làm bài thi trắc nghiệm",
  "Kinh nghiệm chọn ngành đại học",
  "Phương pháp học nhóm hiệu quả",
  "Hướng dẫn sử dụng ChatGPT học tập",
];

const postContents = [
  `<h2>Giới thiệu</h2><p>Trong bài viết này, mình sẽ chia sẻ những kinh nghiệm quý báu...</p><h3>Phương pháp 1</h3><p>Đầu tiên, bạn cần nắm vững kiến thức cơ bản...</p><h3>Phương pháp 2</h3><p>Tiếp theo, hãy luyện tập thường xuyên...</p><p><strong>Kết luận:</strong> Hy vọng bài viết hữu ích cho các bạn!</p>`,
  `<p>Xin chào các bạn! Hôm nay mình muốn chia sẻ một số tips học tập hiệu quả mà mình đã áp dụng.</p><ul><li>Tip 1: Học đều đặn mỗi ngày</li><li>Tip 2: Làm bài tập ngay sau khi học</li><li>Tip 3: Ôn lại kiến thức trước khi đi ngủ</li></ul><p>Chúc các bạn học tốt!</p>`,
  `<h2>Tổng quan</h2><p>Đây là tổng hợp những kiến thức quan trọng...</p><blockquote>Học tập là con đường ngắn nhất dẫn đến thành công</blockquote><p>Các bạn hãy cố gắng nhé!</p>`,
];

const commentContents = [
  "Bài viết rất hay, cảm ơn bạn đã chia sẻ!",
  "Mình đã áp dụng và thấy hiệu quả rồi 👍",
  "Có thể chia sẻ thêm về phần này không?",
  "Cảm ơn nhiều, rất bổ ích!",
  "Bạn có thể cho mình xin tài liệu được không?",
  "Hay quá, mình sẽ thử áp dụng!",
  "Đúng vậy, mình cũng nghĩ như vậy",
  "Có ai đã thử chưa, hiệu quả không?",
  "Bổ sung thêm: nên học vào buổi sáng sớm",
  "Thanks bạn, bài viết rất chi tiết!",
];

const replyContents = [
  "Cảm ơn bạn đã góp ý!",
  "Mình sẽ bổ sung thêm nhé",
  "Đúng rồi, cách này rất hiệu quả",
  "Bạn có thể inbox mình để mình gửi tài liệu",
  "Rất vui vì bài viết hữu ích với bạn!",
];

const messageContents = [
  "Chào bạn, mình muốn hỏi về bài học hôm qua",
  "Bạn có thể giải thích thêm phần này được không?",
  "Cảm ơn bạn nhiều!",
  "Mình hiểu rồi, thanks bạn",
  "Bạn có rảnh vào cuối tuần không?",
  "OK, hẹn gặp bạn nhé",
  "Mình gửi bạn tài liệu nha",
  "Bạn đã nhận được chưa?",
  "Rồi, mình đang xem",
  "Có gì không hiểu cứ hỏi mình nhé",
  "Bạn ơi, bài tập số 5 làm sao vậy?",
  "Để mình giải thích cho bạn",
  "À mình hiểu rồi, cảm ơn bạn!",
  "Không có gì, chúc bạn học tốt!",
];

async function seed() {
  try {
    console.log("🌱 Starting seed process...\n");

    // Connect databases
    await sequelize.authenticate();
    console.log("✅ SQL Server connected");

    await connectMongoDB();
    console.log("✅ MongoDB connected\n");

    // ==========================================
    // Clean up existing data
    // ==========================================
    console.log("🧹 Cleaning up existing data...");

    // Delete in correct order due to foreign keys
    await Message.deleteMany({});
    await PostDetail.deleteMany({});

    await ReplyComment.destroy({ where: {}, force: true });
    await PostComment.destroy({ where: {}, force: true });
    await PostLike.destroy({ where: {}, force: true });
    await Participant.destroy({ where: {}, force: true });
    await Conversation.destroy({ where: {}, force: true });
    await PostHeader.destroy({ where: {}, force: true });

    console.log("  ✓ Cleanup complete\n");

    // Get existing users
    const users = await User.findAll({ raw: true });
    const tutors = users.filter((u) => u.role === "tutor");
    const students = users.filter((u) => u.role === "student");
    const allUsers = [...tutors, ...students];

    console.log(
      `📊 Found ${tutors.length} tutors, ${students.length} students\n`
    );

    // ==========================================
    // 1. Create Posts
    // ==========================================
    console.log("📝 Creating posts...");

    const createdPosts: any[] = [];
    const statuses: ("approved" | "pending" | "rejected")[] = [
      "approved",
      "approved",
      "approved",
      "pending",
      "rejected",
    ];

    for (let i = 0; i < postTitles.length; i++) {
      const author = allUsers[i % allUsers.length];
      const status = statuses[i % statuses.length];

      // Create slug from title
      const slug =
        postTitles[i]
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now();

      // Create PostHeader in SQL
      const post = await PostHeader.create({
        id: uuidv4(),
        authorId: author.userId,
        title: postTitles[i],
        slug,
        status,
        viewCount: Math.floor(Math.random() * 500),
        likeCount: Math.floor(Math.random() * 50),
        commentCount: 0,
        approvedBy: status === "approved" ? tutors[0]?.userId : undefined,
        approvedAt: status === "approved" ? new Date() : undefined,
      });

      // Create PostDetail in MongoDB
      const contentHtml = postContents[i % postContents.length];
      const contentPlain = contentHtml.replace(/<[^>]*>/g, "").trim();

      await PostDetail.create({
        postHeaderId: post.id,
        contentJson: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: contentPlain }],
            },
          ],
        },
        contentPlain,
      });

      createdPosts.push(post);
      console.log(
        `  ✓ Post: "${postTitles[i].substring(0, 30)}..." (${status})`
      );
    }

    // ==========================================
    // 2. Create Comments & Replies
    // ==========================================
    console.log("\n💬 Creating comments and replies...");

    for (const post of createdPosts) {
      if (post.status !== "approved") continue;

      const numComments = Math.floor(Math.random() * 5) + 2; // 2-6 comments per post

      for (let i = 0; i < numComments; i++) {
        const commenter = allUsers[Math.floor(Math.random() * allUsers.length)];

        const comment = await PostComment.create({
          id: uuidv4(),
          postId: post.id,
          userId: commenter.userId,
          content:
            commentContents[Math.floor(Math.random() * commentContents.length)],
          likeCount: Math.floor(Math.random() * 10),
          isEdited: false,
          status: "active",
        });

        // Update post comment count
        await PostHeader.increment("commentCount", { where: { id: post.id } });

        // Add some replies
        const numReplies = Math.floor(Math.random() * 3); // 0-2 replies per comment
        for (let j = 0; j < numReplies; j++) {
          const replier = allUsers[Math.floor(Math.random() * allUsers.length)];
          const mentionedUser = Math.random() > 0.5 ? commenter : null;

          await ReplyComment.create({
            id: uuidv4(),
            commentId: comment.id,
            userId: replier.userId,
            mentionedUserId: mentionedUser?.userId || null,
            content:
              replyContents[Math.floor(Math.random() * replyContents.length)],
            likeCount: Math.floor(Math.random() * 5),
            isEdited: false,
            status: "active",
          });
        }
      }
    }
    console.log("  ✓ Comments and replies created");

    // ==========================================
    // 3. Create Post Likes
    // ==========================================
    console.log("\n❤️ Creating post likes...");

    for (const post of createdPosts) {
      if (post.status !== "approved") continue;

      const numLikes = Math.floor(Math.random() * 8) + 1;
      const likers = allUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, numLikes);

      for (const liker of likers) {
        try {
          await PostLike.create({
            id: uuidv4(),
            postId: post.id,
            userId: liker.userId,
          });
        } catch (e) {
          // Ignore duplicate likes
        }
      }
    }
    console.log("  ✓ Post likes created");

    // ==========================================
    // 4. Create Conversations
    // ==========================================
    console.log("\n💭 Creating conversations...");

    const createdConversations: any[] = [];

    // Create some direct conversations between students and tutors
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const student = students[i];
      const tutor = tutors[i % tutors.length];

      const conversation = await Conversation.create({
        id: uuidv4(),
        type: "direct",
        name: null,
        createdBy: student.userId,
        lastMessageAt: new Date(),
        lastMessagePreview: messageContents[0],
        lastMessageSenderId: student.userId,
      });

      // Add participants
      await Participant.create({
        id: uuidv4(),
        conversationId: conversation.id,
        userId: student.userId,
        role: "member",
        joinedAt: new Date(),
      });

      await Participant.create({
        id: uuidv4(),
        conversationId: conversation.id,
        userId: tutor.userId,
        role: "member",
        joinedAt: new Date(),
      });

      createdConversations.push({ conversation, users: [student, tutor] });
      console.log(`  ✓ Conversation: ${student.name} <-> ${tutor.name}`);
    }

    // Create a group conversation
    if (students.length >= 3) {
      const groupConv = await Conversation.create({
        id: uuidv4(),
        type: "group",
        name: "Nhóm học tập Toán 12",
        createdBy: tutors[0]?.userId,
        lastMessageAt: new Date(),
        lastMessagePreview: "Chào mọi người!",
        lastMessageSenderId: tutors[0]?.userId,
      });

      const groupMembers = [tutors[0], ...students.slice(0, 4)];
      for (const member of groupMembers) {
        await Participant.create({
          id: uuidv4(),
          conversationId: groupConv.id,
          userId: member.userId,
          role: member.role === "tutor" ? "admin" : "member",
          joinedAt: new Date(),
        });
      }

      createdConversations.push({
        conversation: groupConv,
        users: groupMembers,
      });
      console.log(
        `  ✓ Group: "Nhóm học tập Toán 12" (${groupMembers.length} members)`
      );
    }

    // ==========================================
    // 5. Create Messages in MongoDB
    // ==========================================
    console.log("\n📨 Creating messages...");

    for (const { conversation, users } of createdConversations) {
      const numMessages = Math.floor(Math.random() * 15) + 5; // 5-20 messages

      for (let i = 0; i < numMessages; i++) {
        const sender = users[Math.floor(Math.random() * users.length)];
        const messageDate = new Date(Date.now() - (numMessages - i) * 3600000); // 1 hour apart

        await Message.create({
          conversationId: conversation.id,
          senderId: sender.userId,
          content:
            messageContents[Math.floor(Math.random() * messageContents.length)],
          type: "text",
          status: "sent",
          readBy: [{ userId: sender.userId, readAt: messageDate }],
          createdAt: messageDate,
          updatedAt: messageDate,
        });
      }

      // Update conversation last message
      const lastMsg =
        messageContents[Math.floor(Math.random() * messageContents.length)];
      await Conversation.update(
        {
          lastMessagePreview: lastMsg.substring(0, 100),
          lastMessageAt: new Date(),
        },
        { where: { id: conversation.id } }
      );
    }
    console.log("  ✓ Messages created");

    // ==========================================
    // Summary
    // ==========================================
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`📝 Posts created: ${createdPosts.length}`);
    console.log(`💬 Conversations created: ${createdConversations.length}`);
    console.log("✅ Comments, replies, likes, and messages also created");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
