"use client";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const { persist } = useAuthStore as any;

  useEffect(() => {
    persist?.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  return <>{children}</>;
}
