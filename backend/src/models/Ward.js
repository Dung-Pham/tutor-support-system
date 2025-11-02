import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    name: { type: String },
    province_id: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
  },
  { timestamps: true }
);

const Ward = mongoose.model("Ward", wardSchema);
export default Ward;
