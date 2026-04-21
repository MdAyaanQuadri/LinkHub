import express from "express";
import { deleteMe, getMe, updateMe } from "../Controller/user.controller.js";
import { protectRoute } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/me", getMe);
router.put("/me", updateMe);
router.delete("/me", deleteMe);

export default router;
