'use client';

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";

// --- Types ---
interface InterviewQuestion {
  _id: string;
  question: string;
  answer: string;
  difficulty: string;
  categoryId: string;
}

export interface TimestampLog {
  q_idx: number;
  start: number;
  end: number;
}

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
  speakQuestion?: (text: string) => void;
  interviewStarted?: boolean;
  recordingStopped?: boolean;
  reset?: boolean;
  recordingStartTime?: number;
  onTimestampsUpdate?: (timestamps: TimestampLog[]) => void;
}

// --- Constants ---
const DEFAULT_ANSWER_TIME = 40;

// --- InterviewQuestions Component ---
const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  questions: propQuestions,
  speakQuestion,
  interviewStarted,
  recordingStopped,
  reset,
  recordingStartTime,
  onTimestampsUpdate,
}) => {
  const searchParams = useSearchParams();
  const token = useAuthStore.getState().token;
  const categoryId = searchParams.get("categoryId");
  const categoryName = searchParams.get("categoryName");

  const [questions, setQuestions] = useState<InterviewQuestion[]>(propQuestions || []);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timestamps, setTimestamps] = useState<TimestampLog[]>([]);

  const answerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQStartRef = useRef<number>(0);

  // Update questions when props change
  useEffect(() => {
    if (propQuestions && propQuestions.length > 0) {
      setQuestions(propQuestions);
    }
  }, [propQuestions]);

  // Reset logic & capture early stops
  useEffect(() => {
    if (reset || recordingStopped) {
      if (recordingStopped && answerTimerRef.current && currentQStartRef.current > 0) {
        // Record partial completion if stopped directly mid-answer
        const qEnd = (Date.now() - (recordingStartTime || Date.now())) / 1000;
        setTimestamps(prev => {
          if (prev.find(t => t.q_idx === currentIndex)) return prev;
          const newLogs = [...prev, { q_idx: currentIndex, start: currentQStartRef.current, end: qEnd }];
          if (onTimestampsUpdate) onTimestampsUpdate([...newLogs]);
          return newLogs;
        });
      }

      setCurrentIndex(0);
      setTimer(0);
      setShowQuestion(false);
      setIsSpeaking(false);
      setTimestamps([]);
      currentQStartRef.current = 0;
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
      if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
      window.speechSynthesis.cancel();
    }
  }, [reset, recordingStopped]);

  // Main interview flow
  useEffect(() => {
    if (!interviewStarted || questions.length === 0) return;

    const spokenRef = new Set<number>();

    const askQuestion = (index: number) => {
      if (index >= questions.length || recordingStopped) return;

      setCurrentIndex(index);
      setShowQuestion(false);
      setIsSpeaking(true);

      // 🔒 Prevent re-speaking same question
      if (spokenRef.has(index)) return;
      spokenRef.add(index);

      const utterance = new SpeechSynthesisUtterance(
        `Question: ${questions[index].question}`
      );
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0)
        utterance.voice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setShowQuestion(true); // show current question when AI starts talking
        setTimer(DEFAULT_ANSWER_TIME); // Reset timer display visually
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (recordingStopped) return;

        currentQStartRef.current = (Date.now() - (recordingStartTime || Date.now())) / 1000;

        answerTimerRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(answerTimerRef.current!);
              
              const qEnd = (Date.now() - (recordingStartTime || Date.now())) / 1000;
              setTimestamps(prevLogs => {
                const newLogs = [...prevLogs, { q_idx: index, start: currentQStartRef.current, end: qEnd }];
                if (onTimestampsUpdate) onTimestampsUpdate([...newLogs]);
                return newLogs;
              });

              if (!recordingStopped) {
                nextQuestionTimerRef.current = setTimeout(
                  () => askQuestion(index + 1),
                  2000
                );
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };

      window.speechSynthesis.cancel();
      if (!recordingStopped) {
        window.speechSynthesis.speak(utterance);
      }
    };

    askQuestion(0);

    return () => {
      window.speechSynthesis.cancel();
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
      if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
    };
  }, [interviewStarted, questions, recordingStopped]);

  if (loading) return <p>Loading questions...</p>;
  if (questions.length === 0) return <p>No questions found for this category.</p>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="transition-all duration-500">
      <h2 className="text-2xl font-bold mb-4">
        {categoryName ? `Interview: ${categoryName}` : "Interview Questions"}
      </h2>

      {showQuestion && currentQuestion && (
        <div
          key={currentQuestion._id}
          className="p-6 bg-white shadow rounded border-2 border-purple-600 animate-fadeIn"
        >
          <p className="font-semibold text-lg">{currentQuestion.question}</p>
          <p className="text-gray-500 mt-2 text-sm">
            Difficulty: {currentQuestion.difficulty}
          </p>

          {!recordingStopped && (
            <p className="text-red-500 font-semibold mt-4">
              {isSpeaking ? (
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>AI Speaking...</span>
                </span>
              ) : (
                `Time Remaining: ${timer}s`
              )}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewQuestions;