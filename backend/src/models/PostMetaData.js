import mongoose from "mongoose";

const postMetaDataSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visibility: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public",
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
    like_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PostMetaData = mongoose.model("PostMetaData", postMetaDataSchema);
export default PostMetaData;
