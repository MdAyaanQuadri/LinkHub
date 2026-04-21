import { linkSchema } from "../Validation/link.validation.js";
import {
  createLinkForUser,
  deleteLinkForUser,
  getLinksForUser,
  updateLinkForUser,
} from "../Services/link.service.js";

const formatZodErrors = (error) =>
  error.issues.map((e) => ({
    field: e.path[0],
    message: e.message,
  }));

export const createLink = async (req, res) => {
  try {
    const parsed = linkSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const link = await createLinkForUser(req.user._id, parsed.data);
    return res.status(201).json({ success: true, link });
  } catch (error) {
    console.error("[createLink]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

export const getLinks = async (req, res) => {
  try {
    const links = await getLinksForUser(req.user._id, req.query);
    return res.status(200).json({ success: true, links });
  } catch (error) {
    console.error("[getLinks]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = linkSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const link = await updateLinkForUser(req.user._id, id, parsed.data);
    return res.status(200).json({ success: true, link });
  } catch (error) {
    console.error("[updateLink]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteLinkForUser(req.user._id, id);
    return res.status(200).json({ success: true, message: "Link deleted successfully" });
  } catch (error) {
    console.error("[deleteLink]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
