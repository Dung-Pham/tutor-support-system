import mongoose from "mongoose";

const NewsCommentSchema =
  new Schema() <
  INewsComment >
  ({
    news: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["visible", "hidden", "deleted"],
      default: "visible",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  });
export default mongoose.model <
  INewsComment >
  ("NewsComment", NewsCommentSchema);
