import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    introduction: { type: String },
    experienceYears: { type: Number },
    teachingStyle: { type: String },
    specialties: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Tutor = mongoose.model("Tutor", tutorSchema);
export default Tutor;
