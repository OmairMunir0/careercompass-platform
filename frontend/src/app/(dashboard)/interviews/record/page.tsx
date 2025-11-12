'use client';

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import InterviewQuestions from "@/components/InterviewQuestions";
import { set } from "date-fns";

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

const CategoryInterviewsPage: React.FC = () => {
    const { categoryId } = useParams();
    const token = useAuthStore.getState().token;
    const router = useRouter();

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [videoPath, setvideoPath] = useState<any>(null);

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
            setTimeout(() => { //for camera screen to load properly
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

    const stopRecording = async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") return;

        setIsRecording(false);
        setRecordingStarted(false);
        setRecordingStopped(true);
        setResetQuestions(true);

        window.speechSynthesis.cancel();

        await new Promise<void>((resolve) => {
            recorder.onstop = () => resolve();
            recorder.stop();
        });

        try {
            const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            downloadVideo(videoBlob);

            const formData = new FormData();
            formData.append("file", videoBlob, `interview-${Date.now()}.webm`);

            const response = await axiosInstance.post("/interview-videos/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Uploaded video URL:", response.data);
            const { video_path } = response.data;

            const end_path = video_path.split('/')[-1];

            // Redirect to analysis page
            router.push(`/interviews/analysis?video=${encodeURIComponent(end_path)}`);
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Video upload failed. Please try again.");
        } finally {
            recordedChunksRef.current = [];
        }
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
                            <button onClick={handleCancelInterview} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Go Back</button>
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
