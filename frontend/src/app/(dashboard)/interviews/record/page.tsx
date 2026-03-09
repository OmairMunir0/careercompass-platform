'use client';

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import InterviewQuestions from "@/components/InterviewQuestions";
import { useInterviewStore } from "@/store/interviewStore";
import { ClipLoader } from 'react-spinners'

// --- Types ---
interface Interview {
    _id: string;
    title: string;
    description: string;
    date: string;
}

interface InterviewQuestion {
    _id: string;
    question: string;
    answer: string;
    difficulty: string;
    categoryId: string;
}

interface MediaRecorder {
    start(timeslice?: number): void;
    stop(): void;
    ondataavailable: ((event: BlobEvent) => void) | null;
    onstop: ((event: Event) => void) | null;
    state: 'inactive' | 'recording' | 'paused';
}


const loading_screen_comments = [
    "😶 Checking if you're actually smiling or just panicking",
    "🎤 Listening to your voice… pray it's clear 👀",
    "✍️ Transcribing every 'umm' and 'uhh' you dropped",
    "🧠 Comparing your answer with expert-level wisdom ✨",
    "📊 Calculating how cooked you were in that question",
    "😅 Measuring confidence… or lack of it",
    "⏱️ Timing how fast you spoke — racehorse or snail?",
    "🔍 Checking if you used any actual keywords 😂",
    "⚙️ Putting everything together like a pro chef",
    "🔥 Cooking your results… hope you're ready"
];


const CategoryInterviewsPage: React.FC = () => {
    const searchParams = useSearchParams();
    const { addAnalysis } = useInterviewStore();

    const categoryId = searchParams.get('categoryId');
    const categoryName = searchParams.get('categoryName');
    const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : null;

    const token = useAuthStore.getState().token;
    const router = useRouter();

    const [InterviewQuestionFromChild, setInterviewQuestionFromChild] = useState<InterviewQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [videoPath, setvideoPath] = useState<any>(null);
    const [currentComment, setCurrentComment] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState<Boolean>(false);

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
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    // --- Rotate every loading line
    useEffect(() => {
        if (isAnalyzing) {
            const interval = setInterval(() => {
                setCurrentComment((prev) => (prev + 1) % loading_screen_comments.length)
            }, 2000);
            return () => clearInterval(interval)
        }
    }, [isAnalyzing]);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        };
    }, []);

    // Fetch interview questions on mount
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!categoryId) return;
            try {
                const res = await axiosInstance.get("/interview-questions", {
                    params: { categoryId },
                });
                setInterviewQuestionFromChild(res.data);
            } catch (err) {
                console.error("Failed to fetch interview questions:", err);
            }
        };
        fetchQuestions();
    }, [categoryId]);


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

    // --- Recording Format Logic ---
    const mimeTypeRef = useRef<string>("video/webm");

    const startRecording = () => {
        if (!cameraStream) return;

        let options: MediaRecorderOptions = { mimeType: "" };
        let selectedMimeType = "";

        if (MediaRecorder.isTypeSupported("video/mp4")) {
            selectedMimeType = "video/mp4";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
            selectedMimeType = "video/webm;codecs=vp9,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
            selectedMimeType = "video/webm;codecs=vp8,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
            selectedMimeType = "video/webm";
        } else {
            return alert("No supported video format found.");
        }

        options.mimeType = selectedMimeType;
        mimeTypeRef.current = selectedMimeType;

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
            const blob = new Blob(recordedChunksRef.current, { type: selectedMimeType });
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

        setIsAnalyzing(true);
        const currentMimeType = mimeTypeRef.current;
        const fileExtension = currentMimeType.includes("mp4") ? "mp4" : "webm";

        try {
            setLoading(true);
            const videoBlob = new Blob(recordedChunksRef.current, { type: currentMimeType });
            // downloadVideo(videoBlob); //actual download

            const formData = new FormData();
            formData.append("file", videoBlob, `interview-${Date.now()}.${fileExtension}`);

            console.log("Sending questions to backend:", InterviewQuestionFromChild);
            const response = await axiosInstance.post(`/interview-videos/upload?categoryId=${categoryId}&questions=${encodeURIComponent(JSON.stringify(InterviewQuestionFromChild))}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const fastapi_response = response.data.fastapi_response;

            const video_path = fastapi_response.video_path;
            addAnalysis(fastapi_response);

            // Redirect to analysis page
            router.push(`/interviews/analysis?categoryId=${categoryId}&video=${encodeURIComponent(video_path)}`);
            setTimeout(() => {
                // window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Video upload failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
            setLoading(false);
            recordedChunksRef.current = [];
        }
    };

    const downloadVideo = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;

        const extension = mimeTypeRef.current.includes("mp4") ? "mp4" : "webm";
        a.download = `interview-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;

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

    const handleUploadInterview = () => {
        setShowConfirmation(false);
        setShowUploadModal(true);
    };

    // Fetch questions when upload modal opens (if not already loaded)
    useEffect(() => {
        const fetchQuestionsForUpload = async () => {
            if (showUploadModal && InterviewQuestionFromChild.length === 0 && categoryId) {
                try {
                    const res = await axiosInstance.get("/interview-questions", {
                        params: { categoryId },
                    });
                    setInterviewQuestionFromChild(res.data);
                } catch (err) {
                    console.error("Failed to fetch interview questions:", err);
                }
            }
        };
        fetchQuestionsForUpload();
    }, [showUploadModal, categoryId]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid video file (MP4, WebM, MOV, or AVI)');
                return;
            }
            const maxSize = 100 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size must be less than 100MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) {
            alert('Please select a video file first');
            return;
        }
        setShowUploadModal(false);
        setIsAnalyzing(true);
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);
            console.log("Uploading pre-recorded video for analysis");
            const response = await axiosInstance.post(`/interview-videos/upload?categoryId=${categoryId}&questions=${encodeURIComponent(JSON.stringify(InterviewQuestionFromChild))}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const fastapi_response = response.data.fastapi_response;
            const video_path = fastapi_response.video_path;
            addAnalysis(fastapi_response);
            router.push(`/interviews/analysis?categoryId=${categoryId}&video=${encodeURIComponent(video_path)}`);
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Video upload failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
            setLoading(false);
            setSelectedFile(null);
        }
    };

    const handleCancelUpload = () => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setShowConfirmation(true);
    };


    return (
        <div className="max-w-4xl mx-auto mt-6 p-4">
            {loading || isAnalyzing ? (
                <div className="min-h-screen flex flex-col items-center justify-center">
                    <ClipLoader color="#870a90" size={90} />
                    <p className="text-lg font-medium text-gray-700 animate-fade">
                        {loading_screen_comments[currentComment]}
                    </p>
                </div>) : (<>

                    {/* Confirmation Modal */}
                    {showConfirmation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Your Interview?</h3>
                                <p className="text-gray-600 mb-6">Ensure your camera and microphone are ready.</p>
                                <div className="flex flex-col space-y-4">
                                    <div className="flex space-x-4">
                                        <button onClick={handleCancelInterview} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Go Back</button>
                                        <button onClick={handleStartInterview} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Start Interview</button>
                                    </div>
                                    <button onClick={handleUploadInterview} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Upload Interview +</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Interview Modal */}
                    {showUploadModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Interview Video</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Upload a pre-recorded interview video for analysis. Supported formats: MP4, WebM, MOV, AVI (Max 100MB)
                                </p>
                                <div className="mb-6">
                                    <label className="block w-full">
                                        <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            {selectedFile ? (
                                                <div>
                                                    <div className="text-purple-600 mb-2">
                                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                    <p className="text-xs text-purple-600 mt-2">Click to change file</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-gray-400 mb-2">
                                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-600">Click to select video file</p>
                                                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelUpload}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUploadSubmit}
                                        disabled={!selectedFile}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Upload & Analyze
                                    </button>
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
                                questions={InterviewQuestionFromChild}
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
                    )} </>)}
        </div>
    );
};

export default CategoryInterviewsPage;
