"use client";

import { useAuthStore } from "@/store/authStore";
import { BarChart3, Briefcase, LucideIcon, MessageSquare, User, Users } from "lucide-react";
import Link from "next/link";
import ContactSection from "@/components/ContactSection";

interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}

interface ActionCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
}

const RecruiterDashboard = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  const stats: StatCard[] = [
    {
      label: "Active Jobs",
      value: 5,
      icon: Briefcase,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Pending Applications",
      value: 22,
      icon: Users,
      color: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Interviews Scheduled",
      value: 7,
      icon: MessageSquare,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Total Candidates",
      value: 134,
      icon: BarChart3,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const actions: ActionCard[] = [
    {
      title: "Manage Jobs",
      description: "View and edit your postings",
      icon: Briefcase,
      href: "/job-posts",
      iconColor: "text-purple-600",
    },
    {
      title: "Find Candidates",
      description: "Search for qualified talent",
      icon: Users,
      href: "/search-candidates",
      iconColor: "text-purple-600",
    },
    {
      title: "Update Profile",
      description: "Keep your profile current",
      icon: User,
      href: "/profile",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-purple-100">Manage your job postings and connect with top candidates.</p>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
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
        {actions.map(({ title, description, icon: Icon, href, iconColor }) => (
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
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Contact + Map */}
      <ContactSection />
    </div>
  );
};

export default RecruiterDashboard;
