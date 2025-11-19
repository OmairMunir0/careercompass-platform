"use client";

import { useAuthStore } from "@/store/authStore";
import {
  Briefcase,
  BookOpen,
  Heart,
  LucideHome,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  Menu,
  MessageSquare,
  Search,
  User,
  X,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  primary?: boolean;
}

const guestNavItems: NavItem[] = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Sign Up", primary: true },
];

const getAuthNavItems = (role: "candidate" | "recruiter" | "admin"): NavItem[] => {
  const dashboardHref =
    role === "candidate"
      ? "/dashboard?role=candidate"
      : role === "recruiter"
        ? "/dashboard?role=recruiter"
        : role === "admin"
          ? "/dashboard?role=admin"
          : "/dashboard";

  if (role === "candidate") {
    return [
      { href: "/timeline", label: "Home", icon: LucideHome },
      { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
      { href: "/blogs", label: "Blogs", icon: BookOpen },
      { href: "/interviews", label: "Practice Interview", icon: Briefcase },
      { href: "/chats", label: "Chats", icon: MessageSquare },
      { href: "/find-jobs", label: "Find Jobs", icon: Search },
      { href: "/saved-jobs", label: "Saved Jobs", icon: Heart },
      { href: "/profile", label: "Profile", icon: User },
    ];
  }
  else if (role === "admin") {
    return [
      { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/blogs", label: "Blogs", icon: BookOpen },
      { href: "/admin/users", label: "Manage Users", icon: User },
      { href: "/admin/job-posts", label: "Manage Job Posts", icon: Briefcase },
      { href: "/admin/interviews", label: "Manage Interviews", icon: Briefcase },
      { href: "/admin/skills", label: "Manage Skills", icon: MessageSquare },
    ];
  }
  else {
    return [
      { href: "/timeline", label: "Home", icon: LucideHome },
      { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
      { href: "/blogs", label: "Blogs", icon: BookOpen },
      { href: "/interviews", label: "Practice Interview", icon: Briefcase },
      { href: "/chats", label: "Chats", icon: MessageSquare },
      { href: "/job-posts", label: "Job Posts", icon: Briefcase },
      { href: "/search-candidates", label: "Find Candidates", icon: Search },
      { href: "/profile", label: "Profile", icon: User },
    ];
  }
};

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, role, token, logout, fetchCurrentUser } = useAuthStore();
  const isAuthenticated = !!token;

  useEffect(() => {
    if (token && !user) fetchCurrentUser();
    console.log(role);
  }, [token, user, fetchCurrentUser]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems =
    isAuthenticated && role ? getAuthNavItems(role as "candidate" | "recruiter" | "admin") : guestNavItems;

  return (
    <nav className="bg-white shadow-lg border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SkillSeeker</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center flex-col gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${item.primary
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "text-gray-700 hover:text-purple-600"
                    }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <div>{item.label}</div>
                </Link>
              );
            })}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen((p) => !p)}
              className="text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${item.primary
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-gray-700 hover:text-purple-600"
                  }`}
              >
                {Icon && <Icon className="w-4 h-4 inline-block mr-1" />}
                {item.label}
              </Link>
            );
          })}

          {isAuthenticated && (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
