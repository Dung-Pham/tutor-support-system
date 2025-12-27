/**
 * Script to seed fake conversations and messages
 * Usage: npm run seed:conversations -- --count=<number> --messages=<number>
 */

import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../config/sqlserver.js";
import connectMongoDB from "../config/mongodb.js";
import { Conversation, Participant, User } from "../models/sql/index.js";
import { Message } from "../models/mongo/index.js";

// Sample Vietnamese messages for tutoring platform
const sampleMessages = [
  // Greetings
  "Chào bạn! Mình có thể giúp gì cho bạn?",
  "Xin chào, mình muốn hỏi về môn Toán",
  "Hello, em cần hỗ trợ bài tập ạ",
  "Chào thầy/cô, em có một số thắc mắc",

  // Questions
  "Em không hiểu phần này, thầy giải thích giúp em được không ạ?",
  "Bài này làm như thế nào vậy ạ?",
  "Có cách nào đơn giản hơn không ạ?",
  "Em thử rồi nhưng vẫn chưa được, em sai ở đâu ạ?",
  "Phần này em cần ôn tập thêm gì không ạ?",
  "Thầy/cô có tài liệu nào recommend không ạ?",

  // Answers
  "Để thầy giải thích cho em nhé",
  "Cách làm như sau...",
  "Em thử áp dụng công thức này xem",
  "Đúng rồi, em hiểu đúng đấy!",
  "Chỗ này em cần chú ý hơn nhé",
  "Em xem lại bước 3, có vẻ sai ở đó",

  // Confirmations
  "Dạ em hiểu rồi ạ, cảm ơn thầy/cô!",
  "OK em, có gì cứ hỏi nhé",
  "Cảm ơn bạn nhiều!",
  "Rõ ràng hơn nhiều rồi ạ",
  "Em sẽ làm thử lại",

  // Follow-ups
  "Em làm được rồi ạ!",
  "Bài này em đã hiểu, nhưng bài tiếp theo...",
  "Thầy ơi, em có thêm câu hỏi",
  "Khi nào thầy/cô rảnh em hỏi tiếp được không ạ?",

  // Scheduling
  "Chiều nay mình học được không?",
  "Thứ 7 tuần này em rảnh ạ",
  "OK, hẹn gặp lại em nhé!",
  "Em đặt lịch học vào lúc 7h tối nhé",

  // Encouragement
  "Em làm tốt lắm!",
  "Cố gắng lên em!",
  "Tiến bộ nhiều rồi đấy!",
  "Kiên trì là sẽ thành công!",
];

async function seedConversations() {
  try {
    // Parse arguments
    const args = process.argv.slice(2);
    let conversationCount = 5;
    let messagesPerConversation = 10;

    for (const arg of args) {
      if (arg.startsWith("--count=")) {
        conversationCount = parseInt(arg.split("=")[1], 10);
      } else if (arg.startsWith("--messages=")) {
        messagesPerConversation = parseInt(arg.split("=")[1], 10);
      }
    }

    console.log(
      `🚀 Seeding ${conversationCount} conversations with ~${messagesPerConversation} messages each...`
    );

    // Connect to databases
    await sequelize.authenticate();
    console.log("✅ SQL Server connected");

    await connectMongoDB();
    console.log("✅ MongoDB connected");

    // Get students and tutors
    const students = await User.findAll({
      where: { role: "student" },
      attributes: ["id", "displayName"],
    });

    const tutors = await User.findAll({
      where: { role: "tutor" },
      attributes: ["id", "displayName"],
    });

    if (students.length === 0 || tutors.length === 0) {
      console.error("❌ Need at least 1 student and 1 tutor");
      process.exit(1);
    }

    console.log(
      `👥 Found ${students.length} students and ${tutors.length} tutors`
    );

    let totalConversations = 0;
    let totalMessages = 0;

    // Create conversations between random students and tutors
    for (let i = 0; i < conversationCount; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const tutor = tutors[Math.floor(Math.random() * tutors.length)];

      // Check if conversation already exists
      const existingParticipant = await Participant.findOne({
        where: { userId: student.id },
        include: [
          {
            model: Conversation,
            as: "conversation",
            where: { type: "direct" },
            include: [
              {
                model: Participant,
                as: "participants",
                where: { userId: tutor.id },
              },
            ],
          },
        ],
      });

      if (existingParticipant) {
        console.log(
          `  ⏭️  Conversation already exists between ${student.displayName} and ${tutor.displayName}`
        );
        continue;
      }

      // Create conversation
      const conversationStartTime = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ); // Within last 30 days

      const conversation = await Conversation.create({
        type: "direct",
        createdBy: student.id,
        createdAt: conversationStartTime,
        updatedAt: conversationStartTime,
      });

      // Add participants
      await Participant.bulkCreate([
        {
          conversationId: conversation.id,
          userId: student.id,
          role: "member",
          joinedAt: conversationStartTime,
        },
        {
          conversationId: conversation.id,
          userId: tutor.id,
          role: "member",
          joinedAt: conversationStartTime,
        },
      ]);

      totalConversations++;
      console.log(
        `  💬 Created conversation: ${student.displayName} ↔ ${tutor.displayName}`
      );

      // Create random messages
      const messageCount = Math.floor(
        messagesPerConversation * (0.5 + Math.random())
      );
      const participants = [student, tutor];
      let lastMessageTime = conversationStartTime;
      let lastMessage = "";
      let lastSenderId = "";

      for (let j = 0; j < messageCount; j++) {
        // Alternate between student and tutor, with some randomness
        const sender = participants[j % 2 === 0 ? 0 : 1];
        const randomContent =
          sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

        // Messages are spaced 1-60 minutes apart
        lastMessageTime = new Date(
          lastMessageTime.getTime() + (1 + Math.random() * 59) * 60 * 1000
        );

        // Don't create messages in the future
        if (lastMessageTime > new Date()) {
          lastMessageTime = new Date(
            Date.now() - Math.random() * 60 * 60 * 1000
          );
        }

        await Message.create({
          conversationId: conversation.id,
          senderId: sender.id,
          content: randomContent,
          createdAt: lastMessageTime,
          updatedAt: lastMessageTime,
        });

        lastMessage = randomContent;
        lastSenderId = sender.id;
        totalMessages++;
      }

      // Update conversation with last message info
      await conversation.update({
        lastMessageAt: lastMessageTime,
        lastMessagePreview: lastMessage.substring(0, 100),
        lastMessageSenderId: lastSenderId,
        updatedAt: lastMessageTime,
      });
    }

    console.log("\n✅ Seeding completed!");
    console.log(`   📊 Created ${totalConversations} conversations`);
    console.log(`   📨 Created ${totalMessages} messages`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding conversations:", error);
    process.exit(1);
  }
}

seedConversations();
