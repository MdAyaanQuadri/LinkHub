import express from "express";
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
  getPublicFolder,
} from "../Controller/folder.controller.js";
import { protectRoute } from "../Middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (NO AUTH REQUIRED)
router.get("/public/:id", getPublicFolder);

// Apply the auth middleware to all remaining folder routes
router.use(protectRoute);

router.post("/", createFolder);
router.get("/", getFolders);
router.put("/:id", renameFolder);
router.delete("/:id", deleteFolder);

export default router;
