import mongoose from "mongoose";

const cmsPopupSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    imagePublicId: String,
    hours: { type: String, default: "00" },
    minutes: { type: String, default: "00" },
    seconds: { type: String, default: "00" },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CmsPopup", cmsPopupSchema);