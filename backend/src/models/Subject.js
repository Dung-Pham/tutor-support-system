import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String },
    desc: { type: String },
    educationLevel: { type: Number },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
