import Link from "../Models/link.model.js";
import Folder from "../Models/folder.model.js";
import { scrapeUrl } from "./scraper.service.js";
import { ServiceError } from "./service-error.js";

export const createLinkForUser = async (userId, { url, title, description, folderId, isFavorite }) => {
  const normalizedFolderId = folderId || null;

  const existingLink = await Link.findOne({
    userId,
    folderId: normalizedFolderId,
    url,
  });

  if (existingLink) {
    throw new ServiceError("This URL is already saved in this location", 409);
  }

  if (normalizedFolderId) {
    const folder = await Folder.findOne({ _id: normalizedFolderId, userId });

    if (!folder) {
      throw new ServiceError("Folder not found", 404);
    }
  }

  let metadata = { title: "", description: "", siteName: "", previewImage: null };
  if (!title || !description) {
    metadata = await scrapeUrl(url);
  }

  return Link.create({
    url,
    title: title || metadata.title,
    description: description || metadata.description,
    siteName: metadata.siteName,
    previewImage: metadata.previewImage,
    folderId: normalizedFolderId,
    userId,
    isFavorite: isFavorite || false,
  });
};

export const getLinksForUser = async (userId, { folder, search, favorites }) => {
  const query = { userId };

  if (folder && folder !== "null") {
    query.folderId = folder;
  } else if (folder === "null") {
    query.folderId = null;
  }

  if (favorites === "true") {
    query.isFavorite = true;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { url: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  return Link.find(query).sort({ createdAt: -1 });
};

export const updateLinkForUser = async (userId, linkId, { url, title, description, folderId, isFavorite }) => {
  const link = await Link.findOne({ _id: linkId, userId });

  if (!link) {
    throw new ServiceError("Link not found", 404);
  }

  if ((folderId !== undefined && folderId !== link.folderId?.toString()) || url !== link.url) {
    const targetFolderId = folderId !== undefined ? folderId || null : link.folderId;

    const duplicate = await Link.findOne({
      userId,
      folderId: targetFolderId,
      url,
      _id: { $ne: linkId },
    });

    if (duplicate) {
      throw new ServiceError("This URL is already saved in the target location", 409);
    }

    if (folderId && folderId !== link.folderId?.toString()) {
      const folder = await Folder.findOne({ _id: folderId, userId });

      if (!folder) {
        throw new ServiceError("Target folder not found", 404);
      }
    }
  }

  if (url !== link.url && !title) {
    const metadata = await scrapeUrl(url);
    link.title = metadata.title;
    link.description = metadata.description;
    link.siteName = metadata.siteName;
    link.previewImage = metadata.previewImage;
  } else {
    if (title !== undefined) link.title = title;
    if (description !== undefined) link.description = description;
  }

  link.url = url;
  if (folderId !== undefined) link.folderId = folderId || null;
  if (isFavorite !== undefined) link.isFavorite = isFavorite;

  return link.save();
};

export const deleteLinkForUser = async (userId, linkId) => {
  const link = await Link.findOneAndDelete({ _id: linkId, userId });

  if (!link) {
    throw new ServiceError("Link not found", 404);
  }
};
