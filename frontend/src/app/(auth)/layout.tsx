"use client";

import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { HydrationProvider } from "@/providers/HydrationProvider";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, fetchCurrentUser } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!token) {
          return;
        }

        if (!user) {
          await fetchCurrentUser();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, user, fetchCurrentUser]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <Navbar />
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </HydrationProvider>
  );
}
