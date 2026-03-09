"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Users, Briefcase, GraduationCap, Clipboard, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Stats {
    users: number;
    jobs: number;
    interviews: number;
    skills: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ users: 0, jobs: 0, interviews: 0, skills: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get("/admin/stats");
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Active Jobs", value: stats.jobs, icon: Briefcase, color: "text-green-600", bg: "bg-green-100" },
        { label: "Interviews", value: stats.interviews, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Skills", value: stats.skills, icon: Clipboard, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome to the admin dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
                        <div className={`p-4 rounded-lg ${stat.bg} mr-4`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">System Activity</h2>
                </div>
                <p className="text-gray-500">Real-time charts and activity logs can be added here.</p>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                    <span className="text-gray-400">Chart Placeholder</span>
                </div>
            </div>
        </div>
    );
}
