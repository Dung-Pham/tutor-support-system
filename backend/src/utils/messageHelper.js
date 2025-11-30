// Update conversation metadata after a new message is created
export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId
) => {
  // Reset seenBy array and update last message info
  conversation.set({
    seenBy: [], // No one has seen the new message yet
    lastMessageAt: message.createdAt, // Update last message timestamp
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId, // Who sent the message
      createdAt: message.createdAt,
    },
  });

  // Update unread message count for each participant
  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    // If this participant is the sender, reset their unread count to 0
    const isSender = memberId === senderId.toString();
    // Otherwise, increment their unread count by 1
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};
