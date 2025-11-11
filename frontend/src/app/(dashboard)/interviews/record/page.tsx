'use client';

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";

// --- Types ---
interface Interview {
    _id: string;
    title: string;
    description: string;
    date: string;
}

interface MediaRecorder {
    start(timeslice?: number): void;
    stop(): void;
    ondataavailable: ((event: BlobEvent) => void) | null;
    onstop: ((event: Event) => void) | null;
    state: 'inactive' | 'recording' | 'paused';
}

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

// --- Constants ---
const DEFAULT_ANSWER_TIME = 10;

// --- InterviewQuestions Component ---
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
            if (index >= questions.length || recordingStopped) return;

            setCurrentIndex(index);

            const utterance = new SpeechSynthesisUtterance(`Question: ${questions[index].question}`);
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => {
                if (recordingStopped) return;

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

            if (!recordingStopped) window.speechSynthesis.speak(utterance);
        };

        askQuestion(0);

        return () => {
            window.speechSynthesis.cancel();
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
                            className={`p-4 bg-white shadow rounded flex justify-between items-center ${idx === currentIndex ? "border-2 border-purple-600" : ""}`}
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

// --- Main CategoryInterviewsPage Component ---
const CategoryInterviewsPage: React.FC = () => {
    const { categoryId } = useParams();
    const token = useAuthStore.getState().token;

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [interviewStarted, setInterviewStarted] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [recordingStarted, setRecordingStarted] = useState(false);
    const [recordingStopped, setRecordingStopped] = useState(false);
    const [resetQuestions, setResetQuestions] = useState(false);

    // --- TTS Function ---
    const speakQuestion = (text: string) => {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    // --- Fetch interviews ---
    useEffect(() => {
        if (token && categoryId && interviewStarted) fetchInterviews();
    }, [token, categoryId, interviewStarted]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/interviews?categoryId=${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInterviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Interview handlers ---
    const handleStartInterview = () => {
        setShowConfirmation(false);
        setInterviewStarted(true);
    };
    const handleCancelInterview = () => window.history.back();

    // --- Camera & Recording ---
    const initializeCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
            });
            setCameraStream(stream);
            setTimeout(() => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            }, 100);
            setIsCameraReady(true);
        } catch (err) {
            console.error(err);
            alert("Unable to access camera. Check permissions.");
        }
    };

    const startRecording = () => {
        if (!cameraStream) return;

        let options: MediaRecorderOptions = { mimeType: "" };
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) options.mimeType = "video/webm;codecs=vp9,opus";
        else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) options.mimeType = "video/webm;codecs=vp8,opus";
        else if (MediaRecorder.isTypeSupported("video/webm")) options.mimeType = "video/webm";
        else if (MediaRecorder.isTypeSupported("video/mp4")) options.mimeType = "video/mp4";
        else return alert("No supported video format found.");

        const mediaRecorder = new MediaRecorder(cameraStream, options);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];
        setRecordedChunks([]);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
                setRecordedChunks(prev => [...prev, event.data]);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
            downloadVideo(blob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        setRecordingStarted(true);
        setRecordingStopped(false);
        setResetQuestions(false);
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== "inactive") recorder.stop();
        setIsRecording(false);
        setRecordingStarted(false);
        setRecordingStopped(true);
        setResetQuestions(true);

        window.speechSynthesis.cancel();

        // Wait 2 seconds and reload page to reset everything
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    };

    const downloadVideo = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = `interview-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // --- Recording timer ---
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 480) { // max 8 minutes
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    useEffect(() => {
        if (interviewStarted) initializeCamera();
        return () => {
            if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        };
    }, [interviewStarted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    return (
        <div className="max-w-4xl mx-auto mt-6 p-4">
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Your Interview?</h3>
                        <p className="text-gray-600 mb-6">Ensure your camera and microphone are ready.</p>
                        <div className="flex space-x-4">
                            <button onClick={handleCancelInterview} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={handleStartInterview} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Start Interview</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera & Recording */}
            {interviewStarted && (
                <>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Camera Preview</h2>
                        {!isCameraReady ? (
                            <div className="bg-gray-100 rounded-lg p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Initializing camera...</p>
                            </div>
                        ) : (
                            <div className="relative bg-black rounded-lg overflow-hidden">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-96 object-cover" />
                                {isRecording && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-center space-x-4 mt-6">
                            {!isRecording ? (
                                <button onClick={startRecording} disabled={!isCameraReady} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium">Start Recording</button>
                            ) : (
                                <button onClick={stopRecording} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">Stop Recording</button>
                            )}
                        </div>
                    </div>

                    {/* Questions */}
                    <InterviewQuestions
                        speakQuestion={speakQuestion}
                        interviewStarted={recordingStarted}
                        recordingStopped={recordingStopped}
                        reset={resetQuestions}
                    />
                </>
            )}

            {!interviewStarted && !showConfirmation && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Interview session ended.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryInterviewsPage;
