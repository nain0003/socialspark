import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, required: true, enum: ["Environment","Community","Business","Health","Education"] },
  status:      { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  authorName:  { type: String },
  authorRole:  { type: String },
}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
