import { z } from "zod";
import mongoose from "mongoose";

// Helper to validate MongoDB ObjectId
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  });

// ─── Create Folder ───────────────────────────────────────────────────────────
export const createFolderSchema = z.object({
  name: z
    .string({ required_error: "Folder name is required" })
    .min(1, "Folder name cannot be empty")
    .max(100, "Folder name cannot exceed 100 characters")
    .trim(),
  parentFolderId: objectIdSchema.optional().nullable(),
  visibility: z.enum(["private", "public"]).optional().default("private"),
});

// ─── Rename Folder ───────────────────────────────────────────────────────────
export const renameFolderSchema = z.object({
  name: z
    .string({ required_error: "Folder name is required" })
    .min(1, "Folder name cannot be empty")
    .max(100, "Folder name cannot exceed 100 characters")
    .trim(),
  visibility: z.enum(["private", "public"]).optional(),
});
