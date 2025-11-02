import mongoose from "mongoose";

const studyDocumentSchema = new mongoose.Schema(
  {
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    name: { type: String },
    file_path: { type: String },
    loai_file: { type: String },
    created_at: { type: Date, default: Date.now },
    desc: { type: String },
  },
  { timestamps: true }
);

const StudyDocument = mongoose.model("StudyDocument", studyDocumentSchema);
export default StudyDocument;
