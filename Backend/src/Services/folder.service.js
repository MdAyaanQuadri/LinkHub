import Folder from "../Models/folder.model.js";
import Link from "../Models/link.model.js";
import { ServiceError } from "./service-error.js";

export const createFolderForUser = async (userId, { name, parentFolderId, visibility }) => {
  const normalizedParentFolderId = parentFolderId || null;
  let folderVisibility = visibility;

  if (normalizedParentFolderId) {
    const parentFolder = await Folder.findOne({ _id: normalizedParentFolderId, userId });

    if (!parentFolder) {
      throw new ServiceError("Parent folder not found", 404);
    }

    folderVisibility = parentFolder.visibility;
  }

  const existingFolder = await Folder.findOne({
    userId,
    parentFolderId: normalizedParentFolderId,
    name,
  });

  if (existingFolder) {
    throw new ServiceError("A folder with this name already exists in this location", 409);
  }

  return Folder.create({
    name,
    parentFolderId: normalizedParentFolderId,
    userId,
    visibility: folderVisibility,
  });
};

export const getFoldersForUser = async (userId, parent) => {
  let parentFolderId = null;

  if (parent && parent !== "null") {
    parentFolderId = parent;

    const parentFolder = await Folder.findOne({ _id: parentFolderId, userId });

    if (!parentFolder) {
      throw new ServiceError("Parent folder not found", 404);
    }
  }

  return Folder.find({ userId, parentFolderId }).sort({ createdAt: -1 });
};

export const renameFolderForUser = async (userId, folderId, { name, visibility }) => {
  const folder = await Folder.findOne({ _id: folderId, userId });

  if (!folder) {
    throw new ServiceError("Folder not found", 404);
  }

  const existingFolder = await Folder.findOne({
    userId,
    parentFolderId: folder.parentFolderId,
    name,
  });

  if (existingFolder && existingFolder._id.toString() !== folderId) {
    throw new ServiceError("A folder with this name already exists in this location", 409);
  }

  folder.name = name;
  if (visibility) {
    folder.visibility = visibility;
  }

  return folder.save();
};

export const deleteFolderForUser = async (userId, folderId) => {
  const folder = await Folder.findOne({ _id: folderId, userId });

  if (!folder) {
    throw new ServiceError("Folder not found", 404);
  }

  const subfoldersCount = await Folder.countDocuments({ parentFolderId: folderId, userId });

  if (subfoldersCount > 0) {
    throw new ServiceError("Cannot delete a folder that contains subfolders. Please empty it first.", 400);
  }

  await Folder.deleteOne({ _id: folderId, userId });
};

export const getPublicFolderDetails = async (folderId) => {
  const folder = await Folder.findOne({ _id: folderId, visibility: "public" }).lean();
  
  if (!folder) {
    throw new ServiceError("Public folder not found", 404);
  }

  // Fetch public subfolders
  const subfolders = await Folder.find({ 
    parentFolderId: folderId, 
    visibility: "public" 
  }).sort({ createdAt: -1 }).lean();

  // Fetch links in this folder
  const links = await Link.find({ folderId }).sort({ createdAt: -1 }).lean();

  return { folder, subfolders, links };
};
