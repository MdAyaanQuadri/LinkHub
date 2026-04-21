import { createFolderSchema, renameFolderSchema } from "../Validation/folder.validation.js";
import {
  createFolderForUser,
  deleteFolderForUser,
  getFoldersForUser,
  renameFolderForUser,
  getPublicFolderDetails,
} from "../Services/folder.service.js";

const formatZodErrors = (error) =>
  error.issues.map((e) => ({
    field: e.path[0],
    message: e.message,
  }));

// ─── Create a New Folder ─────────────────────────────────────────────────────
export const createFolder = async (req, res) => {
  try {
    const parsed = createFolderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const folder = await createFolderForUser(req.user._id, parsed.data);
    return res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error("[createFolder]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

// ─── Get Folders (Root or Subfolders based on ?parent query) ────────────────
export const getFolders = async (req, res) => {
  try {
    const folders = await getFoldersForUser(req.user._id, req.query.parent);
    return res.status(200).json({ success: true, folders });
  } catch (error) {
    console.error("[getFolders]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

// ─── Rename a Folder ─────────────────────────────────────────────────────────
export const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parsed = renameFolderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const folder = await renameFolderForUser(req.user._id, id, parsed.data);
    return res.status(200).json({ success: true, folder });
  } catch (error) {
    console.error("[renameFolder]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

// ─── Delete a Folder ─────────────────────────────────────────────────────────
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteFolderForUser(req.user._id, id);
    return res.status(200).json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    console.error("[deleteFolder]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

// ─── Get Public Folder ───────────────────────────────────────────────────────
export const getPublicFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getPublicFolderDetails(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[getPublicFolder]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
