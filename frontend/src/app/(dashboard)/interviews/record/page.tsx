'use client';

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";

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

const CategoryInterviewsPage: React.FC = () => {
    const { categoryId } = useParams();
    const token = useAuthStore.getState().token;
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [interviewStarted, setInterviewStarted] = useState(false);

    // Camera and recording states
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        if (token && categoryId && interviewStarted) fetchInterviews();
    }, [token, categoryId, interviewStarted]);


    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 480) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRecording]);


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

    const handleStartInterview = () => {
        setShowConfirmation(false);
        setInterviewStarted(true);
    };

    const handleCancelInterview = () => {
        // Navigate back or close the page
        window.history.back();
    };

    // Camera and recording functions
    const initializeCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true,
            });

            setCameraStream(stream);

            // Wait for React to paint the <video> element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current
                        .play()
                        .then(() => console.log("✅ Camera stream playing"))
                        .catch((err) => {
                            console.error("🚫 Error starting video playback:", err);
                        });
                }
            }, 100);

            setIsCameraReady(true);
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Unable to access camera. Please check permissions.");
        }
    };


    const startRecording = () => {
        if (!cameraStream) return;

        // Choose a supported mimeType
        let options: MediaRecorderOptions = { mimeType: '' };

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
            options.mimeType = "video/webm;codecs=vp9,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
            options.mimeType = "video/webm;codecs=vp8,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
            options.mimeType = "video/webm";
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            options.mimeType = "video/mp4";
        } else {
            alert("No supported video format found for this browser.");
            return;
        }

        const mediaRecorder = new MediaRecorder(cameraStream, options);

        mediaRecorderRef.current = mediaRecorder;

        recordedChunksRef.current = [];
        setRecordedChunks([]);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
                setRecordedChunks((prev) => [...prev, event.data]);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
            downloadVideo(blob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== "inactive") {
            console.log("🟢 Stopping recording...");
            recorder.stop();
            setIsRecording(false);
        } else {
            console.warn("⚠️ No active recording to stop.");
        }
    };


    const downloadVideo = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `interview-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize camera when interview starts
    useEffect(() => {
        if (interviewStarted) {
            initializeCamera();
        }
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [interviewStarted]);

    return (
        <div className="max-w-4xl mx-auto mt-6 p-4">
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
                        <div className="mb-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Your Interview?</h3>
                            <p className="text-gray-600 mb-6">
                                You're about to begin an interview session. Make sure you're in a quiet environment and have your camera and microphone ready if needed.
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleCancelInterview}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartInterview}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                Start Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Content - Only shown after confirmation */}
            {interviewStarted && (
                <>
                    {/* Camera Interface */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Camera Preview</h2>

                        {!isCameraReady ? (
                            <div className="bg-gray-100 rounded-lg p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Initializing camera...</p>
                            </div>
                        ) : (
                            <div className="relative bg-black rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-96 object-cover"
                                />

                                {/* Recording overlay */}
                                {isRecording && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                                    </div>
                                )}

                                {/* Progress bar for recording */}
                                {isRecording && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                                                style={{ width: `${(recordingTime / 480) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-white text-xs text-center mt-1">
                                            {formatTime(recordingTime)} / 08:00
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recording Controls */}
                        <div className="flex justify-center space-x-4 mt-6">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    disabled={!isCameraReady}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                    </svg>
                                    <span>Start Recording</span>
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                    </svg>
                                    <span>Stop Recording</span>
                                </button>
                            )}

                            {/* Test button to end recording */}
                            <button
                                onClick={stopRecording}
                                disabled={!isRecording}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                                Test End Recording
                            </button>
                        </div>
                    </div>

                    {/* Interview Questions */}
                    <div className="mt-8">
                        <h1 className="text-2xl font-bold mb-4">Interview Questions</h1>
                        {loading ? (
                            <p>Loading interviews...</p>
                        ) : interviews.length > 0 ? (
                            <ul className="space-y-4">
                                {interviews.map(interview => (
                                    <li key={interview._id} className="p-4 bg-white shadow rounded">
                                        <h3 className="font-semibold">{interview.title}</h3>
                                        <p className="text-gray-600">{interview.description}</p>
                                        <p className="text-sm text-gray-400">{new Date(interview.date).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No interviews found for this category.</p>
                        )}
                    </div>
                </>
            )}

            {/* Initial state before confirmation */}
            {!interviewStarted && !showConfirmation && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Interview session ended.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryInterviewsPage;
