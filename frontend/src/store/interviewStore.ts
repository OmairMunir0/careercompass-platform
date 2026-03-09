import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AnalysisResult {
  accuracy: {
    video_path: string;
    transcript: string;
    result: Array<{
      question_id: string;
      question: string;
      user_answer: string;
      reference_answer: string;
      similarity: number;
      percentage: number;
      overall_score: number;
    }>;
    overall_score: number;
  };
  emotions: {
    summary: {
      smile_percentage: number;
      confidence_score: number;
      processed_frames: number;
      duration_seconds: number;
    };
    avg_emotions: Record<string, number>;
    dominant_emotions: Record<string, number>;
    feedback: string[];
    emotions_over_time: Array<{
      time: number;
      [key: string]: number;
    }>;
  };
}

interface InterviewStore {
  analysis: AnalysisResult[];
  addAnalysis: (analysis: AnalysisResult) => void;
  clearAnalyses: () => void;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set) => ({
      analysis: [],
      addAnalysis: (analysis) =>
        set((state) => ({
          analysis: [...state.analysis, analysis],
        })),
      clearAnalyses: () => set({ analysis: [] }),
    }),
    {
      name: "interview-storage",
      getStorage: () => localStorage,
    } as any
  )
);