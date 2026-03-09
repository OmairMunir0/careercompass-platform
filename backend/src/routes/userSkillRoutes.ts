import { Router } from "express";
import { deleteMySkill, getMySkillSet, updateMySkillSet } from "../controllers/userSkillController";
import { authenticated } from "../middleware/auth";

const router = Router();
router.use(authenticated);

router.get("/me", getMySkillSet);
router.put("/me", updateMySkillSet);
router.delete("/me/:skillId", deleteMySkill);

export default router;
