'use-client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";

interface Interview {
    _id: string;
    title: string;
    description: string;
    date: string;
}

const CategoryInterviewsPage: React.FC = () => {
    const { categoryId } = useParams();
    const token = useAuthStore.getState().token;
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token && categoryId) fetchInterviews();
    }, [token, categoryId]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/interviews?categoryId=${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInterviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 p-4">
            <h1 className="text-2xl font-bold mb-4">Interviews for Category</h1>
            {loading ? (
                <p>Loading interviews...</p>
            ) : interviews.length > 0 ? (
                <ul className="space-y-4">
                    {interviews.map(interview => (
                        <li key={interview._id} className="p-4 bg-white shadow rounded">
                            <h3 className="font-semibold">{interview.title}</h3>
                            <p className="text-gray-600">{interview.description}</p>
                            <p className="text-sm text-gray-400">{new Date(interview.date).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No interviews found for this category.</p>
            )}
        </div>
    );
};

export default CategoryInterviewsPage;
