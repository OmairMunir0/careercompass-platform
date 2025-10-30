import { useAuthStore } from "@/store/authStore";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const { isAuthenticated, isCandidate, isRecruiter } = useAuthStore();

  return (
    <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connect Talent with
            <span className="block text-purple-200">Opportunity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
            SkillSeeker is the modern platform where talented professionals meet innovative
            companies. Find your next career move or discover your next star employee.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/timeline"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center justify-center"
              >
                Go to Timeline
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              {isCandidate && (
                <Link
                  href="/jobs"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                >
                  Browse Jobs
                </Link>
              )}
              {isRecruiter && (
                <Link
                  href="/post-job"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                >
                  Post a Job
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
