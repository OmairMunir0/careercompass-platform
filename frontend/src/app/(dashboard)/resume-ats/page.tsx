"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import {
    FileText,
    Sparkles,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Lightbulb,
    ArrowLeft,
    Download,
    Bookmark,
    Briefcase,
    Search,
    Upload
} from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface JobPost {
    _id: string;
    title: string;
    description: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    recruiter: {
        firstName: string;
        lastName: string;
        companyName?: string;
    };
    requiredSkills?: Array<{ name: string }>;
    jobType?: { name: string };
    workMode?: { name: string };
}

interface ATSResult {
    jobPost: JobPost;
    ats_score: {
        overall_score: number;
        breakdown: {
            keyword_match: number;
            skill_match: number;
            semantic_similarity: number;
            formatting: number;
        };
    };
    keyword_analysis: {
        total_keywords: number;
        matched: Array<{ keyword: string; frequency: number }>;
        missing: Array<{ keyword: string }>;
        match_rate: number;
    };
    skill_analysis: {
        matched: string[];
        missing: string[];
        match_percentage: number;
    };
    formatting_issues: string[];
    suggestions: Array<{
        priority: string;
        category: string;
        suggestion: string;
        impact: string;
    }>;
    analyzedAt: string;
}

const ResumeATSPage: React.FC = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [savedJobs, setSavedJobs] = useState<JobPost[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
    const [results, setResults] = useState<ATSResult | null>(null);

    useEffect(() => {
        loadJobs();
    }, [user?._id]);

    const loadJobs = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            // Load saved jobs only
            const savedResponse = await axiosInstance.get(`/saved-jobs`);
            setSavedJobs(
                savedResponse.data
                    .map((item: any) => item.job)
                    .filter((job: any) => job !== null)
            );
        } catch (error) {
            console.error("Failed to load jobs:", error);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    console.log("Saved Jobs:", savedJobs);

    const handleAnalyze = async (job: JobPost) => {

        setAnalyzing(true);
        setSelectedJob(job);
        setResults(null);

        try {
            const response = await axiosInstance.post("/ats/analyze", {
                jobId: job._id, userId: user?._id
            });

            if (response.data.success) {
                setResults(response.data.data);
                toast.success("Analysis complete!");
            } else {
                throw new Error(response.data.message || "Analysis failed");
            }

        } catch (error: any) {
            console.error("Failed to analyze resume:", error);
            const msg = error.response?.data?.message || "Failed to analyze resume. Please upload a resume first.";
            toast.error(msg);
            if (msg.includes("upload")) {
                router.push('/profile');
            }
        } finally {
            setAnalyzing(false);
        }
    };


    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        return "Needs Improvement";
    };

    const JobCard = ({ job, onAnalyze }: { job: JobPost; onAnalyze: (job: JobPost) => void }) => (
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                        {job.recruiter.companyName || `${job.recruiter.firstName} ${job.recruiter.lastName}`}
                    </p>
                    {job.location && (
                        <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                    )}
                </div>
                <button
                    onClick={() => onAnalyze(job)}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    {analyzing && selectedJob?._id === job._id ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-4 h-4" />
                            <span>Calculated ATS</span>
                        </>
                    )}
                </button>
            </div>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                        >
                            {skill.name}
                        </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{job.requiredSkills.length - 5} more
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600">
                {job.jobType && (
                    <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.jobType.name}
                    </span>
                )}
                {job.salaryMin && job.salaryMax && (
                    <span>
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to use the ATS Resume Checker</p>
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {!results ? (
                    <>
                        {/* Header */}
                        <div className="mb-8">
                            <Link
                                href="/profile"
                                className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Profile
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-purple-600" />
                                    ATS Resume Checker
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Check your resume against your saved jobs.
                                </p>
                            </div>
                        </div>

                        {/* Job Lists */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                </div>
                            ) : (
                                <>
                                    {savedJobs.length === 0 ? (
                                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-medium text-gray-900 mb-2">No saved jobs</h3>
                                            <p className="text-gray-600 mb-4">Save jobs to analyze your resume compatibility</p>
                                            <Link
                                                href="/find-jobs"
                                                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Browse Jobs
                                            </Link>
                                        </div>
                                    ) : (
                                        savedJobs.map(job => (
                                            <JobCard key={job._id} job={job} onAnalyze={handleAnalyze} />
                                        ))
                                    )}
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    /* Results Section */
                    <div className="space-y-6">
                        {/* Back Button */}
                        <button
                            onClick={() => setResults(null)}
                            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Saved Jobs
                        </button>

                        {/* Job Info
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{results.jobPost.title}</h2>
                            <p className="text-gray-600">
                                {results.jobPost.recruiter.companyName || `${results.jobPost.recruiter.firstName} ${results.jobPost.recruiter.lastName}`}
                            </p>
                        </div> */}

                        {/* Overall Score */}
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">ATS Compatibility Score</h2>
                                    <p className="text-purple-100">
                                        {getScoreLabel(results.ats_score.overall_score)} - Your resume is{" "}
                                        {results.ats_score.overall_score >= 80
                                            ? "highly compatible"
                                            : results.ats_score.overall_score >= 60
                                                ? "moderately compatible"
                                                : "not well optimized"}{" "}
                                        with this job
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-bold">
                                        {results.ats_score.overall_score}
                                    </div>
                                    <div className="text-xl text-purple-100">/ 100</div>
                                </div>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(results.ats_score.breakdown).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-2 capitalize">
                                            {key.replace(/_/g, " ")}
                                        </p>
                                        <div className="flex items-end gap-2">
                                            <span className={`text-3xl font-bold ${getScoreColor(value)}`}>
                                                {value}
                                            </span>
                                            <span className="text-gray-500 mb-1">/100</span>
                                        </div>
                                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${value >= 80
                                                    ? "bg-green-500"
                                                    : value >= 60
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                    }`}
                                                style={{ width: `${value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Keyword Analysis */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Keyword Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        Matched Keywords ({results.keyword_analysis.matched.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {results.keyword_analysis.matched.slice(0, 5).map((kw, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                                                <span className="text-gray-900">{kw.keyword}</span>
                                                <span className="text-sm text-gray-600">
                                                    {kw.frequency}x
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        Missing Keywords ({results.keyword_analysis.missing.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {results.keyword_analysis.missing.slice(0, 5).map((kw, idx) => (
                                            <div key={idx} className="bg-red-50 rounded-lg p-3">
                                                <span className="text-gray-900">{kw.keyword}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skill Analysis */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Skill Gap Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Matched Skills ({results.skill_analysis.matched.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {results.skill_analysis.matched.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Missing Skills ({results.skill_analysis.missing.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {results.skill_analysis.missing.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formatting Issues */}
                        {results.formatting_issues.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    Formatting Issues
                                </h3>
                                <div className="space-y-2">
                                    {results.formatting_issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-yellow-50 rounded-lg p-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-gray-900">{issue}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                                Optimization Suggestions
                            </h3>
                            <div className="space-y-3">
                                {results.suggestions.map((suggestion, idx) => (
                                    <div
                                        key={idx}
                                        className={`border-l-4 rounded-lg p-4 ${suggestion.priority === "HIGH"
                                            ? "border-red-500 bg-red-50"
                                            : "border-yellow-500 bg-yellow-50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs font-semibold ${suggestion.priority === "HIGH"
                                                            ? "bg-red-200 text-red-800"
                                                            : "bg-yellow-200 text-yellow-800"
                                                            }`}
                                                    >
                                                        {suggestion.priority}
                                                    </span>
                                                    <span className="text-sm text-gray-600">{suggestion.category}</span>
                                                </div>
                                                <p className="text-gray-900">{suggestion.suggestion}</p>
                                            </div>
                                            <span className="text-sm font-medium text-purple-600 whitespace-nowrap">
                                                {suggestion.impact}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setResults(null)}
                                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                            >
                                Analyze Another Job
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                                <Download className="w-5 h-5" />
                                Download Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeATSPage;
