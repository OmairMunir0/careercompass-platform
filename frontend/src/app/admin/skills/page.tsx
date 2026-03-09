"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

interface Skill {
    _id: string;
    name: string;
    category: { _id: string; name: string };
    createdAt: string;
}

interface Category {
    _id: string;
    name: string;
}

export default function ManageSkills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // New Skill Form
    const [newSkillName, setNewSkillName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [skillsRes, catsRes] = await Promise.all([
                axiosInstance.get("/admin/skills"),
                axiosInstance.get("/skill-categories") // Assuming this public endpoint exists
            ]);

            if (skillsRes.data.success) setSkills(skillsRes.data.data);

            // Skill Categories API returns the array directly or in a different format
            // Based on inspection, it returns the array directly: res.json(formatted)
            if (Array.isArray(catsRes.data)) {
                setCategories(catsRes.data);
            } else if (catsRes.data.success) {
                setCategories(catsRes.data.data);
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load skills data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkillName || !selectedCategory) {
            toast.error("Please fill all fields");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axiosInstance.post("/admin/skills", {
                name: newSkillName,
                categoryId: selectedCategory
            });

            if (response.data.success) {
                toast.success("Skill added successfully");
                setSkills([...skills, response.data.data]);
                setNewSkillName("");
                setSelectedCategory("");
            }
        } catch (error: any) {
            console.error("Failed to add skill:", error);
            toast.error(error.response?.data?.error || "Failed to add skill");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteSkill = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skill?")) return;

        try {
            const response = await axiosInstance.delete(`/admin/skills/${id}`);
            if (response.data.success) {
                toast.success("Skill deleted successfully");
                setSkills(skills.filter(s => s._id !== id));
            }
        } catch (error: any) {
            console.error("Failed to delete skill:", error);
            toast.error(error.response?.data?.error || "Failed to delete skill");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Skills</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Skill Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-24">
                    <h2 className="text-lg font-semibold mb-4">Add New Skill</h2>
                    <form onSubmit={handleAddSkill} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g. React.js"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? "Adding..." : <><Plus className="w-4 h-4 mr-2" /> Add Skill</>}
                        </button>
                    </form>
                </div>

                {/* Skills List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">All Skills ({skills.length})</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : skills.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No skills found.
                                        </td>
                                    </tr>
                                ) : (
                                    skills.map((skill) => (
                                        <tr key={skill._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {skill.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {skill.category ? skill.category.name : "Uncategorized"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => deleteSkill(skill._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
