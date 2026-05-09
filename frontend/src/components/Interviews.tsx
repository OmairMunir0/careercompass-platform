'use client';

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface SkillCategory {
    _id: string;
    name: string;
}

const Interviews: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const token = useAuthStore.getState().token;
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (token) fetchSkillCategories();
    }, [token]);

    const fetchSkillCategories = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/skill-categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSkillCategories(res.data);
        } catch (error) {
            console.error("Error fetching skill categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category: SkillCategory) => {
        router.push(`/interviews/record?categoryId=${category._id}&categoryName=${encodeURIComponent(category.name)}`);
    };

    const handleCustomInterview = () => {
        if (!user) {
            alert('Please log in to start a custom interview');
            return;
        }
        setShowCustomModal(true);
    };

    const handleCustomInterviewStart = () => {
        setShowCustomModal(false);
        // Navigate to record page with custom interview parameters
        router.push(`/interviews/record?custom=true&numQuestions=${numQuestions}&userId=${user._id}`);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Choose Your Interview Type</h2>

            {loading ? (
                <p className="text-gray-500">Loading options...</p>
            ) : (
                <div className="space-y-6">
                    {/* Custom Interview Option */}
                    <div
                        onClick={handleCustomInterview}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl hover:scale-105 transform transition-all duration-200 text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">🎯 Custom Interview</h3>
                                <p className="text-purple-100">Personalized questions based on your profile, skills, and experience</p>
                            </div>
                            <div className="text-3xl">⚡</div>
                        </div>
                    </div>

                    {/* Skill Categories */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Or choose a skill category:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {skillCategories.map(cat => (
                                <div
                                    onClick={() => handleCategorySelect(cat)}
                                    key={cat._id}
                                    className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl hover:scale-105 transform transition-all duration-200"
                                >
                                    <p className="text-gray-800 font-medium text-center">{cat.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Interview Modal */}
            {showCustomModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Interview Setup</h3>
                        <p className="text-gray-600 mb-6">
                            We'll generate personalized questions based on your profile, experience, and skills.
                        </p>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Questions
                            </label>
                            <select
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value={3}>3 Questions</option>
                                <option value={5}>5 Questions</option>
                                <option value={7}>7 Questions</option>
                                <option value={10}>10 Questions</option>
                            </select>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCustomModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCustomInterviewStart}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            >
                                Start Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interviews;