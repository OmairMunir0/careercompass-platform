'use client';
import { useAuthStore } from "@/store/authStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useSearchParams } from "next/navigation";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#34d399", "#60a5fa", "#f87171", "#fbbf24", "#a78bfa"];

const Analysis: React.FC = () => {
  const { user } = useAuthStore();
  const { analysis } = useInterviewStore();
  const searchParams = useSearchParams();
  const video = searchParams.get("video");

  const latestAnalysis = analysis.length > 0 ? analysis[analysis.length - 1] : null;

  if (!latestAnalysis) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-semibold mb-3">No Analysis Found</h2>
        <p className="text-gray-500">Complete an interview first.</p>
      </div>
    );
  }

  const result = latestAnalysis.result || [];         
  const overallScore = latestAnalysis.overall_score;
  console.log(latestAnalysis)

  const emotionData = Object.entries(latestAnalysis.emotions || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value),
  }));

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Interview Analysis Report</h1>
        <p className="text-gray-500 text-sm">
          Analyzed for <b>{user?.firstName + " " + user?.lastName || "Guest"}</b>
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Overall Performance Score</h2>
          <p className="text-sm text-indigo-100 mt-1">Based on answer accuracy</p>
        </div>
        <div className="text-5xl font-bold">{overallScore}%</div>
      </div>

      {/* Questions */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Question-by-Question</h2>
        <div className="space-y-4">
          {result.length > 0 ? (
            result.map((q: any) => (
              <div
                key={q.question_id}
                className={`p-4 rounded-lg border-l-4 ${
                  q.percentage >= 80 ? "border-green-500 bg-green-50" :
                  q.percentage >= 50 ? "border-yellow-500 bg-yellow-50" :
                  "border-red-500 bg-red-50"
                }`}
              >
                <p className="font-medium text-gray-800">{q.question}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>You:</strong> {q.user_answer || "<No answer>"}
                </p>
                <p className="text-sm mt-1">
                  <strong>Score:</strong>{" "}
                  <span className={
                    q.percentage >= 80 ? "text-green-600 font-bold" :
                    q.percentage >= 50 ? "text-yellow-600 font-bold" :
                    "text-red-600 font-bold"
                  }>
                    {q.percentage}%
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No questions found.</p>
          )}
        </div>
      </div>

      {/* Emotions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Emotion Distribution</h2>
          {emotionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={emotionData} cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name} (${value}%)`} dataKey="value">
                  {emotionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No emotion data</p>
          )}
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Emotion Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(latestAnalysis.emotions || {}).map(([emotion, percent], i) => (
              <div key={emotion} className="flex justify-between items-center">
                <span className="capitalize text-gray-700 text-lg font-medium">{emotion}</span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                  {percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Summary</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>
            Your <b>overall score</b> is <b>{overallScore}%</b> —{" "}
            {overallScore >= 80 ? "Bohat zabardast!" : overallScore >= 60 ? "Theek hai, aur mehnat karo" : "Bhai, bohat kaam karna parega"}
          </li>
          <li>Focus on answering the <b>exact question</b> — no bakwas</li>
          <li>Keep practicing. Tu ban jayega top developer Inshallah</li>
        </ul>
      </div>
    </div>
  );
};

export default Analysis;