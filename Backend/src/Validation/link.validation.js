import { z } from "zod";
import mongoose from "mongoose";

// Helper to validate MongoDB ObjectId
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  });

// ─── Create or Update Link ───────────────────────────────────────────────────
// We make the metadata fields (title, description, etc) optional because
// we'll use Open Graph scraping as a fallback if the user doesn't provide them.
export const linkSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .url("Please provide a valid URL")
    .trim(),
    
  title: z
    .string()
    .max(200, "Title cannot exceed 200 characters")
    .trim()
    .optional(),
    
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
    
  folderId: objectIdSchema.optional().nullable(),
  
  isFavorite: z.boolean().optional(),
});
