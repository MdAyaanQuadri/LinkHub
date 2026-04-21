import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    parentFolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
  },
  {
    timestamps: true,
  }
);

// ⚡ Fast queries (get folders by user + parent)
folderSchema.index({ userId: 1, parentFolderId: 1 });

// 🔒 Prevent duplicate names in same folder (same user)
folderSchema.index(
  { userId: 1, parentFolderId: 1, name: 1 },
  { unique: true }
);

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
