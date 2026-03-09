// src/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Users,
  GraduationCap,
  Clipboard,
  Building,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Building }, // Using Building as placeholder or LayoutDashboard if available
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Manage Interviews", href: "/admin/interviews", icon: GraduationCap },
  { label: "Manage Skills", href: "/admin/skills", icon: Clipboard },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuthStore();
  const router = useRouter();

  // Check for admin role (case insensitive to be safe)
  if (role?.toLowerCase() !== "admin") return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 pt-16 z-40">
      {/* Added pt-16 assuming Navbar is fixed at top, removed standalone header */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
