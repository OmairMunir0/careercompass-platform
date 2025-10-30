// src/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Users,
  User,
  GraduationCap,
  Briefcase,
  Clipboard,
  MessageSquare,
  FileText,
  Building,
} from "lucide-react";

const menuItems = [
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Profiles", href: "/admin/profiles", icon: User },
  { label: "Education", href: "/admin/education", icon: GraduationCap },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Job Postings", href: "/admin/jobs", icon: Clipboard },
  { label: "Conversations", href: "/admin/chats", icon: MessageSquare },
  { label: "Posts", href: "/admin/posts", icon: FileText },
  { label: "Roles & Permissions", href: "/admin/roles", icon: Building },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);

  if (role !== "ADMIN") return null;

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold text-purple-600">Admin</div>
      <nav className="flex-1 px-2 py-4 space-y-2 bg-gray-100">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-100 ${
                isActive ? "bg-purple-600 text-white" : ""
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
