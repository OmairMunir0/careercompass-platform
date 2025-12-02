import { Request, Response } from "express";
import { IUserSkill, UserSkill } from "../models/UserSkill";

/**
 * @desc Get the logged-in user's skill set
 * @route GET /api/user-skills/me
 * @access Private
 */
export const getMySkillSet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userSkills: IUserSkill[] = await UserSkill.find({ user: userId })
      .populate("skillId", "name")
      .populate("proficiencyLevelId", "name");
    res.json(userSkills);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Add or update the logged-in user's skill set
 * @route PUT /api/user-skills/me
 * @access Private
 */
export const updateMySkillSet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { skills } = req.body;
    if (!Array.isArray(skills)) return res.status(400).json({ message: "Invalid skills format" });

    const bulkOps = skills.map((s) => ({
      updateOne: {
        filter: { user: userId, skillId: s.skillId },
        update: {
          $set: {
            proficiencyLevelId: s.proficiencyLevelId || null,
            user: userId,
          },
        },
        upsert: true,
      },
    }));

    await UserSkill.bulkWrite(bulkOps);
    const updatedSkills = await UserSkill.find({ user: userId })
      .populate("skillId", "name")
      .populate("proficiencyLevelId", "name");
    res.json(updatedSkills);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Remove a skill from the logged-in user's skill set
 * @route DELETE /api/user-skills/me/:skillId
 * @access Private
 */
export const deleteMySkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { skillId } = req.params;
    const deleted = await UserSkill.findOneAndDelete({ user: userId, skillId });
    if (!deleted) return res.status(404).json({ message: "Skill not found" });
    res.json({ message: "Skill removed successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
