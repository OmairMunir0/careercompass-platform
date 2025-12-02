import compression from "compression";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

const CLIENT_URLS = (process.env.CLIENT_URL || "").split(",").map((url) => url.trim());

// CORS middleware
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman or server-to-server
    if (CLIENT_URLS.includes(origin)) callback(null, true);
    else callback(null , true);
    // else callback(new Error("Not allowed by CORS"));
  },
});

// Helmet security headers
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Logging
export const morganMiddleware = morgan("dev");

// Body parsing
export const jsonMiddleware = express.json({ limit: "10mb" });
export const urlencodedMiddleware = express.urlencoded({ extended: true, limit: "10mb" });

// Rate limiting - more lenient for notification routes
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for notification routes (they poll frequently)
    return req.path.startsWith("/api/notifications");
  },
});

// Separate rate limit for notification routes (more lenient)
export const notificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Higher limit for notifications
  standardHeaders: true,
  legacyHeaders: false,
});

// Compression
export const compressionMiddleware = compression();

// Convert req.params to ObjectIds
export const objectIdParamsMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const params = req.params as Record<string, any>;
  for (const key in params) {
    if (typeof params[key] === "string" && mongoose.Types.ObjectId.isValid(params[key])) {
      params[key] = new mongoose.Types.ObjectId(params[key]);
    }
  }
  next();
};
