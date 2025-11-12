import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnalysisResult {
  video_path: string;
  overall_score: number;
  emotions: Record<string, number>;
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
    }
  )
);
