"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import React, { useEffect, useState } from "react";
import Interviews from "@/components/Interviews";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}


const Interview: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const token = useAuthStore.getState().token;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Please log in to view the Interview.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Interview</h1>
      
      <Interviews />

    </div>
  );
};

export default Interview;