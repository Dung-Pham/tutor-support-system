import mongoose from "mongoose";

const conversationsMetaDataSchema = new mongoose.Schema(
  {
    person1_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    person2_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
  },
  { timestamps: true }
);

const ConversationsMetaData = mongoose.model(
  "ConversationsMetaData",
  conversationsMetaDataSchema
);
export default ConversationsMetaData;
