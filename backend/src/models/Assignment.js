import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    grade: { type: Number },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    start: { type: Date },
    end: { type: Date },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
