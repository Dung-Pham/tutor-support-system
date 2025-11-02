import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  },
  { timestamps: true }
);

const ClassModel = mongoose.model("Class", classSchema);
export default ClassModel;
