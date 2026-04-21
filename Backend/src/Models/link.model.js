import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "", // fallback if OG fails
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    previewImage: {
      type: String,
      default: null, // may not exist
    },
    siteName: {
      type: String,
      default: "",
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ⚡ Fast queries
linkSchema.index({ userId: 1, folderId: 1 });

// 🔒 Prevent duplicate links in same folder
linkSchema.index(
  { userId: 1, folderId: 1, url: 1 },
  { unique: true }
);

const Link = mongoose.model("Link", linkSchema);

export default Link;
