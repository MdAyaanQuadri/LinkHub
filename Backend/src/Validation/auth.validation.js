import { z } from "zod";

// ─── Sign Up ────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .trim(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

// ─── Update Profile ─────────────────────────────────────────────────────────

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .trim()
      .optional(),

    email: z
      .string()
      .email("Please provide a valid email address")
      .toLowerCase()
      .trim()
      .optional(),

    password: z.string().min(6, "Password must be at least 6 characters").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
