import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./Config/env.js";
import authRoutes from "./Routes/auth.routes.js";
import folderRoutes from "./Routes/folder.routes.js";
import linkRoutes from "./Routes/link.routes.js";
import userRoutes from "./Routes/user.routes.js";

const app = express();

// Middlewares
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "LinkHub API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/links", linkRoutes);

export default app;
