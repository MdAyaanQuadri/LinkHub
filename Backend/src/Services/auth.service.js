import User from "../Models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.utils.js";
import { generateToken } from "../utils/jwt.utils.js";
import { ServiceError } from "./service-error.js";

const formatAuthResponse = (user, message) => ({
  success: true,
  message,
  token: generateToken({ id: user._id, email: user.email }),
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
  },
});

export const signupUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ServiceError("An account with this email already exists", 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return formatAuthResponse(user, "Account created successfully");
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ServiceError("Invalid email or password", 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ServiceError("Invalid email or password", 401);
  }

  return formatAuthResponse(user, "Logged in successfully");
};
