// SQL Server Models - Associations
// Using UserAccount as the main user table

import UserAccount from "./UserAccount.js";
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

// Alias for backward compatibility
const User = UserAccount;

// User associations
UserAccount.hasMany(Session, { foreignKey: "userId", as: "sessions" });
UserAccount.hasMany(PostHeader, { foreignKey: "authorId", as: "posts" });
UserAccount.hasMany(PostComment, { foreignKey: "userId", as: "comments" });
UserAccount.hasMany(ReplyComment, { foreignKey: "userId", as: "replies" });
UserAccount.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
UserAccount.hasMany(CommentLike, { foreignKey: "userId", as: "commentLikes" });
UserAccount.hasMany(ReplyCommentLike, {
  foreignKey: "userId",
  as: "replyLikes",
});
UserAccount.hasMany(Participant, {
  foreignKey: "userId",
  as: "participations",
});
UserAccount.hasMany(Notification, {
  foreignKey: "receiverId",
  as: "notifications",
});
UserAccount.hasMany(Notification, {
  foreignKey: "senderId",
  as: "sentNotifications",
});

// Session associations
Session.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });

// PostHeader associations
PostHeader.belongsTo(UserAccount, { foreignKey: "authorId", as: "author" });
PostHeader.belongsTo(UserAccount, { foreignKey: "approvedBy", as: "approver" });
PostHeader.belongsTo(UserAccount, { foreignKey: "rejectedBy", as: "rejecter" });
PostHeader.belongsTo(UserAccount, {
  foreignKey: "deletedBy",
  as: "deletedByUser",
});
PostHeader.hasMany(PostComment, { foreignKey: "postId", as: "comments" });
PostHeader.hasMany(PostLike, { foreignKey: "postId", as: "likes" });

// PostComment associations
PostComment.belongsTo(PostHeader, { foreignKey: "postId", as: "post" });
PostComment.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });
PostComment.hasMany(ReplyComment, { foreignKey: "commentId", as: "replies" });
PostComment.hasMany(CommentLike, { foreignKey: "commentId", as: "likes" });

// ReplyComment associations
ReplyComment.belongsTo(PostComment, { foreignKey: "commentId", as: "comment" });
ReplyComment.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });
ReplyComment.belongsTo(UserAccount, {
  foreignKey: "mentionedUserId",
  as: "mentionedUser",
});
ReplyComment.hasMany(ReplyCommentLike, { foreignKey: "replyId", as: "likes" });

// PostLike associations
PostLike.belongsTo(PostHeader, { foreignKey: "postId", as: "post" });
PostLike.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });

// CommentLike associations
CommentLike.belongsTo(PostComment, { foreignKey: "commentId", as: "comment" });
CommentLike.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });

// ReplyCommentLike associations
ReplyCommentLike.belongsTo(ReplyComment, {
  foreignKey: "replyId",
  as: "reply",
});
ReplyCommentLike.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });

// Conversation associations
Conversation.belongsTo(UserAccount, { foreignKey: "createdBy", as: "creator" });
Conversation.belongsTo(UserAccount, {
  foreignKey: "lastMessageSenderId",
  as: "lastSender",
});
Conversation.hasMany(Participant, {
  foreignKey: "conversationId",
  as: "participants",
});

// Participant associations
Participant.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});
Participant.belongsTo(UserAccount, { foreignKey: "userId", as: "user" });

// Notification associations - Updated to match schema (receiver_id, sender_id)
Notification.belongsTo(UserAccount, {
  foreignKey: "receiverId",
  as: "receiver",
});
Notification.belongsTo(UserAccount, { foreignKey: "senderId", as: "sender" });

// Many-to-Many through Participant
UserAccount.belongsToMany(Conversation, {
  through: Participant,
  foreignKey: "userId",
  otherKey: "conversationId",
  as: "conversations",
});
Conversation.belongsToMany(UserAccount, {
  through: Participant,
  foreignKey: "conversationId",
  otherKey: "userId",
  as: "members",
});

// Many-to-Many through PostLike
UserAccount.belongsToMany(PostHeader, {
  through: PostLike,
  foreignKey: "userId",
  otherKey: "postId",
  as: "likedPosts",
});
PostHeader.belongsToMany(UserAccount, {
  through: PostLike,
  foreignKey: "postId",
  otherKey: "userId",
  as: "likers",
});

export {
  User,
  UserAccount,
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
export * from "./UserAccount.js";
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
