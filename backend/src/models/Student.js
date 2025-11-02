import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    gradeLevel: { type: Number },
    school: { type: String },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
