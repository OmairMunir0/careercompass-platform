"use client";

import { useAuthStore } from "@/store/authStore";
import { Heart, LucideIcon, MessageSquare, Search, User } from "lucide-react";
import Link from "next/link";
import ContactSection from "@/components/ContactSection";

interface StatCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

interface ActionCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const CandidateDashboard = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  // --- Static demo stats (replace with API data later)
  const stats: StatCard[] = [
    {
      label: "Job Applications",
      value: 12,
      icon: Search,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Saved Jobs",
      value: 8,
      icon: Heart,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Messages",
      value: 3,
      icon: MessageSquare,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Profile Views",
      value: 24,
      icon: User,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // --- Quick actions
  const actions: ActionCard[] = [
    {
      title: "Browse Jobs",
      description: "Find your perfect opportunity",
      icon: Search,
      href: "/find-jobs",
    },
    {
      title: "Saved Jobs",
      description: "Review your saved positions",
      icon: Heart,
      href: "/saved-jobs",
    },
    {
      title: "Update Profile",
      description: "Keep your profile current",
      icon: User,
      href: "/profile",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-purple-100">Ready to find your next opportunity? Let's get started.</p>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className={`p-2 rounded-lg ${color.split(" ")[0]}`}>
              <Icon className={`h-6 w-6 ${color.split(" ")[1]}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map(({ title, description, icon: Icon, href }) => (
          <Link
            key={title}
            href={href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
              <Icon className="h-8 w-8 text-purple-600" />
            </div>
          </Link>
        ))}
      </div>

      {/* Contact + Map */}
      <ContactSection />
    </div>
  );
};

export default CandidateDashboard;
