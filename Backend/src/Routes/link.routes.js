import express from "express";
import {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
} from "../Controller/link.controller.js";
import { protectRoute } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createLink);
router.get("/", getLinks);
router.put("/:id", updateLink);
router.delete("/:id", deleteLink);

export default router;
