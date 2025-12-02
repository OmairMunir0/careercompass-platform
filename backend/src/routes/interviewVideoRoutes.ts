import { Router } from "express";
import multer from "multer";
import { authenticated } from "../middleware/auth";
import {
  uploadInterviewVideo,
  // getInterviewVideos,
  // getInterviewVideo,
  // deleteInterviewVideo,
} from "../controllers/interviewVideoController";

const storage = multer.memoryStorage();
export const upload = multer({ storage });
const router = Router();

// @route   POST /api/interview-videos/upload
// @desc    Upload an interview video to Fast API
// @access  Private
router.post("/upload", authenticated, upload.single("file"), uploadInterviewVideo);

// // @route   GET /api/interview-videos
// // @desc    Get all interview videos
// // @access  Private
// router.get("/", authenticated, getInterviewVideos);

// // @route   GET /api/interview-videos/:videoName
// // @desc    Get a single video by name
// // @access  Private
// router.get("/:videoName", authenticated, getInterviewVideo);

// // @route   DELETE /api/interview-videos/:videoName
// // @desc    Delete a video by name
// // @access  Private
// router.delete("/:videoName", authenticated, deleteInterviewVideo);

export default router;
