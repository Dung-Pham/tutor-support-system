import mongoose from "mongoose";

// Friend Model
// Represents established friendships between users
// Uses a consistent ordering of user IDs to prevent duplicate friend relationships
const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to first user in the friendship
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to second user in the friendship
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Pre-save middleware to ensure consistent ordering of user IDs
// This prevents duplicate friend relationships by always storing users in alphabetical order by ID
// For example: if userA's ID > userB's ID, they get swapped before saving
friendSchema.pre("save", async function (next) {
  const a = this.userA.toString(); // Convert ObjectId to string for comparison
  const b = this.userB.toString();

  // If userA's ID is greater than userB's ID, swap them for consistent ordering
  if (a > b) {
    this.userA = mongoose.Types.ObjectId(b); // Note: This should be 'new mongoose.Types.ObjectId(b)' in newer Mongoose versions
    this.userB = mongoose.Types.ObjectId(a);
  }

  next(); // Continue with the save operation
});

// Compound unique index to prevent duplicate friendships
// Ensures only one friendship record exists between any two users
friendSchema.index({ userA: 1, userB: 1 }, { unique: true });

// Create and export the Friend model
const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
