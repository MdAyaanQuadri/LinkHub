import User from "../Models/user.model.js";
import Folder from "../Models/folder.model.js";
import Link from "../Models/link.model.js";
import { hashPassword } from "../utils/hash.utils.js";
import { ServiceError } from "./service-error.js";

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  return formatUser(user);
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  if (updates.email && updates.email !== user.email) {
    const existingUser = await User.findOne({ email: updates.email, _id: { $ne: userId } });

    if (existingUser) {
      throw new ServiceError("An account with this email already exists", 409);
    }

    user.email = updates.email;
  }

  if (updates.username !== undefined) {
    user.username = updates.username;
  }

  if (updates.password !== undefined) {
    user.password = await hashPassword(updates.password);
  }

  const savedUser = await user.save();
  return formatUser(savedUser);
};

export const deleteUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  await Link.deleteMany({ userId });
  await Folder.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
};
