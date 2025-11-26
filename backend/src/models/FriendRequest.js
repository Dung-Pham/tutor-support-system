import mongoose from "mongoose";

// Friend Request Model
// Handles friend requests between users in the system
// A friend request is sent from one user to another and can include an optional message
const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user sending the friend request
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user receiving the friend request
      required: true,
    },
    message: {
      type: String,
      maxlength: 300, // Optional message with the friend request (max 300 characters)
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Compound index to ensure only one friend request exists between any two users
// Prevents duplicate friend requests between the same pair of users
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// Index on 'from' field for efficient queries when finding requests sent by a user
friendRequestSchema.index({ from: 1 });

// Index on 'to' field for efficient queries when finding requests received by a user
friendRequestSchema.index({ to: 1 });

// Create and export the FriendRequest model
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
