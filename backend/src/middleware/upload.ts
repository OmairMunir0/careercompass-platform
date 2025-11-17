// src/middleware/upload.ts
import { Request } from "express";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";

// multer does not support async so we need this
function ensureFolderSync(folder: string) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
}

const subfoldersMap: Record<string, string> = {
  resume: "resumes",
  profileImage: "profile-images",
  postImage: "post-images",
  certificate: "certificates",
  blogImage: "blog-images",
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), "uploads");
    const folderPath = path.join(uploadsDir, subfoldersMap[file.fieldname] || "others");
    ensureFolderSync(folderPath);
    cb(null, folderPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
