import { Request, Response } from "express";
import { User } from "../models/User";
import { JobPost } from "../models/JobPost";
import { InterviewQuestion } from "../models/InterviewQuestion";
import { Skill } from "../models/Skill";

// Get system stats
export const getStats = async (req: Request, res: Response) => {
    try {
        const [userCount, jobCount, interviewCount, skillCount] = await Promise.all([
            User.countDocuments(),
            JobPost.countDocuments(),
            InterviewQuestion.countDocuments(),
            Skill.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                jobs: jobCount,
                interviews: interviewCount,
                skills: skillCount,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
};

// Get all users with pagination and search
export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const query: any = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("-passwordHash")
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("roleId", "name");

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
};


// Toggle user ban status
export const toggleBan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`,
            data: { isBanned: user.isBanned }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to toggle user ban status" });
    }
};

// Get all interviews 
export const getInterviewQuestions = async (req: Request, res: Response) => {
    try {
        const questions = await InterviewQuestion.find();
        res.status(200).json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch interview questions" });
    }
}

// Get all skills
export const getSkills = async (req: Request, res: Response) => {
    try {
        const skills = await Skill.find().populate("category");
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch skills" });
    }
};

// Add skill
export const createSkill = async (req: Request, res: Response) => {
    try {
        const { name, categoryId } = req.body;
        const skill = await Skill.create({ name, category: categoryId });
        res.status(201).json({ success: true, data: skill });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to create skill" });
    }
};

// Delete skill
export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Skill.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Skill deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete skill" });
    }
};
