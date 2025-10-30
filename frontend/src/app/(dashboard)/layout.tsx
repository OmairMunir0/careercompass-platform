"use client";

import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { HydrationProvider } from "@/providers/HydrationProvider";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, fetchCurrentUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          router.replace("/login");
          return;
        }
        if (!user) {
          await fetchCurrentUser();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        logout();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token, user, fetchCurrentUser, logout, router]);

  if (loading) return <Loader />;
  if (!token || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <Navbar />
      <DashboardInner>{children}</DashboardInner>
    </HydrationProvider>
  );
}
