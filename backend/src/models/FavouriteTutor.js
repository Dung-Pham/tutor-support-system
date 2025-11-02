import mongoose from "mongoose";

const favouriteTutorSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: { type: String },
  },
  { timestamps: true }
);

const FavouriteTutor = mongoose.model("FavouriteTutor", favouriteTutorSchema);
export default FavouriteTutor;
