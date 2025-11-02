import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    tutor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

applicationSchema.index({ tutor_id: 1, class_id: 1 });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
