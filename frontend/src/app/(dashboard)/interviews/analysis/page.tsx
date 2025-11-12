'use client';

import { useAuthStore } from "@/store/authStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#34d399", "#60a5fa", "#f87171", "#fbbf24", "#a78bfa"];

const Analysis: React.FC = () => {
  const { user } = useAuthStore();
  const { analysis } = useInterviewStore();
  const searchParams = useSearchParams();
  const video = searchParams.get("video");

  // ✅ Pick the last analysis (latest interview)
  const latestAnalysis = analysis.length > 0 ? analysis[analysis.length - 1] : null;

  if (!latestAnalysis) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-semibold mb-3">No Analysis Found</h2>
        <p className="text-gray-500">
          It looks like you haven’t completed an interview yet.
        </p>
      </div>
    );
  }

  const emotionData = Object.entries(latestAnalysis.emotions).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 space-y-8">
      {/* --- Header --- */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Interview Analysis Report
        </h1>
        <p className="text-gray-500 text-sm">
          Analyzed for <b>{user?.firstName + " " + user?.lastName || "Guest"}</b>
        </p>
      </div>

      {/* --- Video Player --- */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          🎥 Replay Your Interview
        </h2>
        <video
          width="100%"
          height="360"
          controls
          className="rounded-lg shadow border border-gray-200"
        >
          <source
            src={latestAnalysis.video_path || video || ""}
            type="video/webm"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* --- Score Section --- */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Overall Performance Score</h2>
          <p className="text-sm text-indigo-100 mt-1">
            Based on tone, expression, and emotional balance.
          </p>
        </div>
        <div className="text-5xl font-bold">{latestAnalysis.overall_score}%</div>
      </div>

      {/* --- Emotions --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotion Chart */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            🧠 Emotion Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name} (${value}%)`}
                dataKey="value"
              >
                {emotionData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Breakdown */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-center">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            💬 Emotion Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(latestAnalysis.emotions).map(([emotion, percent], i) => (
              <div key={emotion} className="flex justify-between items-center">
                <span className="capitalize text-gray-700 text-lg font-medium">
                  {emotion}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                >
                  {percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Summary Section --- */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          📈 Summary Insights
        </h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>
            Your <b>overall confidence level</b> and body language appear strong.
          </li>
          <li>
            You maintained a <b>balanced emotional tone</b> with mostly happy and
            neutral expressions.
          </li>
          <li>
            Slight moments of hesitation (sad expression 5%) were detected —
            consider improving transitions between answers.
          </li>
          <li>
            Overall, you performed exceptionally well! 🎯
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analysis;
