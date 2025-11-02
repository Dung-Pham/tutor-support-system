import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

const Province = mongoose.model("Province", provinceSchema);
export default Province;
