import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import {
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware,
  jsonMiddleware,
  morganMiddleware,
  objectIdParamsMiddleware,
  rateLimitMiddleware,
  urlencodedMiddleware,
} from "./middleware/server";
import routes from "./routes";
import cors from "cors";

const uploadsPath = path.join(process.cwd(), "uploads");

const app = express();

// Trust proxy for rate limiting behind reverse proxy (nginx, etc.)
app.set("trust proxy", 1);

app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(morganMiddleware);
app.use(jsonMiddleware);
app.use(urlencodedMiddleware);
app.use(rateLimitMiddleware);
app.use(compressionMiddleware);
app.use(objectIdParamsMiddleware);
app.use("/uploads", express.static(uploadsPath));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Convert req.params to ObjectIds
app.use((req: Request, _res: Response, next: NextFunction) => {
  const params = req.params as Record<string, any>;
  for (const key in params) {
    if (
      typeof params[key] === "string" &&
      mongoose.Types.ObjectId.isValid(params[key])
    ) {
      params[key] = new mongoose.Types.ObjectId(params[key]);
    }
  }
  next();
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "ok" });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(404).json({ success: false, error: "API not found" });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

export default app;
