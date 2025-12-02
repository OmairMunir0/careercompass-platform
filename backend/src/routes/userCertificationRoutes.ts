import { Router } from "express";
import {
  createCertification,
  deleteCertification,
  getCertification,
  getMyCertifications,
  getUserCertifications,
  updateCertification,
} from "../controllers/userCertificationController";
import { authenticated } from "../middleware/auth";

const router = Router();
router.use(authenticated);

router.post("/", createCertification);
router.get("/", getUserCertifications);
router.get("/me", getMyCertifications);
router.get("/:certificationId", getCertification);
router.put("/:certificationId", updateCertification);
router.delete("/:certificationId", deleteCertification);

export default router;
