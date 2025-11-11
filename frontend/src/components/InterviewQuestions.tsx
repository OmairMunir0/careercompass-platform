'use client';

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";

interface InterviewQuestion {
    _id: string;
    question: string;
    answer: string;
    difficulty: string;
    categoryId: string;
}

interface InterviewQuestionsProps {
    speakQuestion?: (text: string) => void;
    interviewStarted?: boolean;
    recordingStopped?: boolean;
    reset?: boolean;
}

const DEFAULT_ANSWER_TIME = 10;

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
    speakQuestion,
    interviewStarted,
    recordingStopped,
    reset,
}) => {
    const searchParams = useSearchParams();
    const token = useAuthStore.getState().token;
    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("categoryName");

    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timer, setTimer] = useState(0);

    const answerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const nextQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch questions
    useEffect(() => {
        if (token && categoryId) fetchQuestions();
    }, [token, categoryId]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/interview-questions", {
                headers: { Authorization: `Bearer ${token}` },
                params: { categoryId, categoryName },
            });
            setQuestions(res.data);
        } catch (err) {
            console.error("Error fetching interview questions:", err);
        } finally {
            setLoading(false);
        }
    };

    // Reset logic
    useEffect(() => {
        if (reset || recordingStopped) {
            setCurrentIndex(0);
            setTimer(0);
            if (answerTimerRef.current) clearInterval(answerTimerRef.current);
            if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
            window.speechSynthesis.cancel();
        }
    }, [reset, recordingStopped]);

    // Main interview flow
    useEffect(() => {
        if (!interviewStarted || questions.length === 0) return;

        const askQuestion = (index: number) => {
            if (index >= questions.length || recordingStopped) return; // STOP if recording stopped

            setCurrentIndex(index);

            const utterance = new SpeechSynthesisUtterance(`Question: ${questions[index].question}`);
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => {
                if (recordingStopped) return; // prevent next question
                setTimer(DEFAULT_ANSWER_TIME);

                answerTimerRef.current = setInterval(() => {
                    setTimer(prev => {
                        if (prev <= 1) {
                            clearInterval(answerTimerRef.current!);
                            if (!recordingStopped) {
                                nextQuestionTimerRef.current = setTimeout(() => askQuestion(index + 1), 2000);
                            }
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            };

            // **Immediately cancel queued speeches if recording stopped**
            if (!recordingStopped) {
                window.speechSynthesis.speak(utterance);
            }
        };

        askQuestion(0);

        return () => {
            window.speechSynthesis.cancel(); // stop all speech
            if (answerTimerRef.current) clearInterval(answerTimerRef.current);
            if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
        };
    }, [interviewStarted, questions, recordingStopped]);



    const handleSpeakButton = (text: string) => {
        if (!speakQuestion || recordingStopped) return;
        speakQuestion(text);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">
                {categoryName ? `Questions for ${categoryName}` : "Interview Questions"}
            </h2>

            {loading ? (
                <p>Loading questions...</p>
            ) : questions.length > 0 ? (
                <ul className="space-y-4">
                    {questions.map((q, idx) => (
                        <li
                            key={q._id}
                            className={`p-4 bg-white shadow rounded flex justify-between items-center ${idx === currentIndex ? "border-2 border-purple-600" : ""
                                }`}
                        >
                            <div>
                                <p className="font-semibold">{q.question}</p>
                                <p className="text-gray-600">Answer: {q.answer}</p>
                                <p className="text-sm text-gray-400">Difficulty: {q.difficulty}</p>
                                {idx === currentIndex && !recordingStopped && (
                                    <p className="text-red-500 font-semibold mt-2">
                                        Time Remaining: {timer}s
                                    </p>
                                )}
                            </div>
                            {speakQuestion && !recordingStopped && (
                                <button
                                    onClick={() => handleSpeakButton(q.question)}
                                    className="ml-4 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                                >
                                    🔊
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No questions found for this category.</p>
            )}
        </div>
    );
};

export default InterviewQuestions;