'use client';

import { useAuthStore } from "@/store/authStore";
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

const Analysis: React.FC = () => {
    const { user } = useAuthStore();
    const token = useAuthStore.getState().token;
    const searchParams = useSearchParams();
    const video = searchParams.get('video');
    console.log("Video param:", video);

    return (
        <div className="max-w-4xl mx-auto mt-6 p-4">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Interview Analysis</h1>

            <div className="bg-white shadow rounded-lg p-6">
                {
                    video ? 
                        <div>
                            <div className="border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                Analysis content will be displayed here.
                            </div>
                        </div>
                        : <p>Loading analysis for video: {video}</p>
                }
            </div>
        </div>
    );
};

export default Analysis;