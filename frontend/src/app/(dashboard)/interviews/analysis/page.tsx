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
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { generateInterviewCertificate } from "@/lib/pdfGenerator";
import toast from "react-hot-toast";

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

  const result = latestAnalysis.accuracy.result || [];
  const overallScore = latestAnalysis.accuracy.overall_score;
  const totalQuestions = result.length;
  const questionsAnswered = totalQuestions - result.filter(question => question.percentage === 0).length;

  const emotionData = Object.entries(latestAnalysis.emotions?.avg_emotions || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value),
  }));

  const emotionSummary = latestAnalysis.emotions?.summary;
  const feedback = latestAnalysis.emotions?.feedback || [];

  console.log(latestAnalysis);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Interview Analysis Report
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-500 text-sm">
            Analyzed for <b>{user?.firstName + " " + user?.lastName || "Guest"}</b>
          </p>
          {user && (
            <button
              onClick={() => {
                try {
                  generateInterviewCertificate(user, latestAnalysis);
                  toast.success("Certificate downloaded successfully!");
                } catch (error) {
                  console.error("Error generating certificate:", error);
                  toast.error("Failed to generate certificate");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <Download size={18} />
              Download Certificate
            </button>
          )}
        </div>
      </div>

      {/* AI Confidence & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold">Technical Accuracy</h2>
            <p className="text-sm text-indigo-100 mt-1">Based on your answer content</p>
          </div>
          <div className="mt-4">
            <div className="text-5xl font-bold">{overallScore}%</div>
            <p className="text-sm text-indigo-100 mt-2">Questions Answered: {questionsAnswered}/{totalQuestions}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between border-l-4 border-yellow-400">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Emotional Confidence</h2>
            <p className="text-sm text-gray-500 mt-1">AI-detected facial analysis</p>
          </div>
          <div className="mt-4">
            <div className="text-5xl font-bold text-gray-900">{emotionSummary?.confidence_score || 0}%</div>
            <p className="text-sm text-gray-500 mt-2">Smile Frequency: {emotionSummary?.smile_percentage || 0}%</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Question-by-Question</h2>
        <div className="space-y-4">
          {result.length > 0 ? (
            result.map((q: any) => (
              <details
                key={q.question_id}
                className={`group rounded-lg border-l-4 overflow-hidden transition-all duration-300 ${q.percentage >= 80 ? "border-green-500 bg-green-50" :
                  q.percentage >= 50 ? "border-yellow-500 bg-yellow-50" :
                    "border-red-500 bg-red-50"
                  }`}
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-2 py-1 rounded text-sm font-bold ${q.percentage >= 80 ? "bg-green-200 text-green-800" :
                        q.percentage >= 50 ? "bg-yellow-200 text-yellow-800" :
                          "bg-red-200 text-red-800"
                      }`}>
                      {q.percentage}%
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                  </div>
                </summary>

                <div className="px-4 pb-4 pt-0 text-sm text-gray-700 space-y-2 border-t border-gray-200/50 mt-2 mx-4 pt-4">
                  <p>
                    <strong className="block text-gray-900 mb-1">Your Answer:</strong>
                    {q.user_answer || "<No answer provided>"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium text-gray-900">Score Assessment:</span>
                    <span className={
                      q.percentage >= 80 ? "text-green-600 font-bold" :
                        q.percentage >= 50 ? "text-yellow-600 font-bold" :
                          "text-red-600 font-bold"
                    }>
                      {q.percentage >= 80 ? "Excellent" : q.percentage >= 50 ? "Good" : "Needs Improvement"}
                    </span>
                  </div>
                </div>
              </details>
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
          <h2 className="text-lg font-semibold mb-4 text-gray-800">AI Feedback</h2>
          <div className="space-y-3">
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              {feedback.length > 0 ? feedback.map((f, i) => (
                <li key={i}>{f}</li>
              )) : <li>No specific feedback generated.</li>}
            </ul>
          </div>
          <h2 className="text-lg font-semibold mt-6 mb-4 text-gray-800">Emotion Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(latestAnalysis.emotions?.avg_emotions || {}).map(([emotion, percent], i) => (
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
          {feedback.length > 0 ? feedback.map((f, i) => (
            <li key={i}>{f}</li>
          )) : <li>No specific feedback generated.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Analysis;