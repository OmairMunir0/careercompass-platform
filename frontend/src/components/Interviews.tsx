'use-client';

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
    const token = useAuthStore.getState().token;
    const router = useRouter();

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
        router.push(`/interviews/${category._id}`);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Choose Your Skill Category</h2>

            {loading ? (
                <p className="text-gray-500">Loading skill categories...</p>
            ) : (
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
            )}
        </div>
    );
};

export default Interviews;