import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["blog", "course", "combo", "workshop"], // optional
    },

    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: String,
    },

    author: {
      type: String,
    },

    date: {
      type: Date,
    },

    excerpt: {
      type: String,
    },
imageUrl: String,
imagePublicId: String,

    

    content: {
      type: String,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", ServiceSchema);

export default Service;
