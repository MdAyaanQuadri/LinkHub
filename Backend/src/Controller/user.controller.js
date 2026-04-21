import { updateUserSchema } from "../Validation/auth.validation.js";
import {
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../Services/user.service.js";

const formatZodErrors = (error) =>
  error.issues.map((e) => ({
    field: e.path[0],
    message: e.message,
  }));

export const getMe = async (req, res) => {
  try {
    const user = await getUserProfile(req.user._id);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("[getMe]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const user = await updateUserProfile(req.user._id, parsed.data);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("[updateMe]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

export const deleteMe = async (req, res) => {
  try {
    await deleteUserProfile(req.user._id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[deleteMe]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
