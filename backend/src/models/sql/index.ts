/**
 * File: models/sql/index.ts
 * Mục đích: Export tất cả SQL Server models và thiết lập associations
 */

import User from "./User.js";
import Session from "./Session.js";
import PostHeader from "./PostHeader.js";
import PostComment from "./PostComment.js";
import ReplyComment from "./ReplyComment.js";
import PostLike from "./PostLike.js";
import CommentLike from "./CommentLike.js";
import ReplyCommentLike from "./ReplyCommentLike.js";
import Conversation from "./Conversation.js";
import Participant from "./Participant.js";
import Notification from "./Notification.js";

// ==========================================
// ASSOCIATIONS
// ==========================================

// User associations
User.hasMany(Session, { foreignKey: "userId", as: "sessions" });
User.hasMany(PostHeader, { foreignKey: "authorId", as: "posts" });
User.hasMany(PostComment, { foreignKey: "userId", as: "comments" });
User.hasMany(ReplyComment, { foreignKey: "userId", as: "replies" });
User.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
User.hasMany(CommentLike, { foreignKey: "userId", as: "commentLikes" });
User.hasMany(ReplyCommentLike, { foreignKey: "userId", as: "replyLikes" });
User.hasMany(Participant, { foreignKey: "userId", as: "participations" });
User.hasMany(Notification, { foreignKey: "recipientId", as: "notifications" });
User.hasMany(Notification, { foreignKey: "senderId", as: "sentNotifications" });

// Session associations
Session.belongsTo(User, { foreignKey: "userId", as: "user" });

// PostHeader associations
PostHeader.belongsTo(User, { foreignKey: "authorId", as: "author" });
PostHeader.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });
PostHeader.belongsTo(User, { foreignKey: "rejectedBy", as: "rejecter" });
PostHeader.hasMany(PostComment, { foreignKey: "postId", as: "comments" });
PostHeader.hasMany(PostLike, { foreignKey: "postId", as: "likes" });
PostHeader.hasMany(Notification, { foreignKey: "postId", as: "notifications" });

// PostComment associations
PostComment.belongsTo(PostHeader, { foreignKey: "postId", as: "post" });
PostComment.belongsTo(User, { foreignKey: "userId", as: "user" });
PostComment.hasMany(ReplyComment, { foreignKey: "commentId", as: "replies" });
PostComment.hasMany(CommentLike, { foreignKey: "commentId", as: "likes" });
PostComment.hasMany(Notification, {
  foreignKey: "commentId",
  as: "notifications",
});

// ReplyComment associations
ReplyComment.belongsTo(PostComment, { foreignKey: "commentId", as: "comment" });
ReplyComment.belongsTo(User, { foreignKey: "userId", as: "user" });
ReplyComment.hasMany(ReplyCommentLike, { foreignKey: "replyId", as: "likes" });

// PostLike associations
PostLike.belongsTo(PostHeader, { foreignKey: "postId", as: "post" });
PostLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// CommentLike associations
CommentLike.belongsTo(PostComment, { foreignKey: "commentId", as: "comment" });
CommentLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// ReplyCommentLike associations
ReplyCommentLike.belongsTo(ReplyComment, {
  foreignKey: "replyId",
  as: "reply",
});
ReplyCommentLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// Conversation associations
Conversation.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Conversation.belongsTo(User, {
  foreignKey: "lastMessageSenderId",
  as: "lastSender",
});
Conversation.hasMany(Participant, {
  foreignKey: "conversationId",
  as: "participants",
});
Conversation.hasMany(Notification, {
  foreignKey: "conversationId",
  as: "notifications",
});

// Participant associations
Participant.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});
Participant.belongsTo(User, { foreignKey: "userId", as: "user" });

// Notification associations
Notification.belongsTo(User, { foreignKey: "recipientId", as: "recipient" });
Notification.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Notification.belongsTo(PostHeader, { foreignKey: "postId", as: "post" });
Notification.belongsTo(PostComment, { foreignKey: "commentId", as: "comment" });
Notification.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

// Many-to-Many through Participant
User.belongsToMany(Conversation, {
  through: Participant,
  foreignKey: "userId",
  otherKey: "conversationId",
  as: "conversations",
});
Conversation.belongsToMany(User, {
  through: Participant,
  foreignKey: "conversationId",
  otherKey: "userId",
  as: "members",
});

// Many-to-Many through PostLike (Users who liked posts)
User.belongsToMany(PostHeader, {
  through: PostLike,
  foreignKey: "userId",
  otherKey: "postId",
  as: "likedPosts",
});
PostHeader.belongsToMany(User, {
  through: PostLike,
  foreignKey: "postId",
  otherKey: "userId",
  as: "likers",
});

// ==========================================
// EXPORTS
// ==========================================
export {
  User,
  Session,
  PostHeader,
  PostComment,
  ReplyComment,
  PostLike,
  CommentLike,
  ReplyCommentLike,
  Conversation,
  Participant,
  Notification,
};

// Export types
export * from "./User.js";
export * from "./Session.js";
export * from "./PostHeader.js";
export * from "./PostComment.js";
export * from "./ReplyComment.js";
export * from "./PostLike.js";
export * from "./CommentLike.js";
export * from "./ReplyCommentLike.js";
export * from "./Conversation.js";
export * from "./Participant.js";
export * from "./Notification.js";
