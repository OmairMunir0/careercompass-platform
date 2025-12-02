import { useAuthStore } from "@/store/authStore";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Benefits() {
  const { isAuthenticated } = useAuthStore();

  const benefits = [
    "Advanced job matching algorithm",
    "Real-time messaging system",
    "Comprehensive candidate profiles",
    "Easy job posting and management",
    "Mobile-responsive design",
    "Secure and reliable platform",
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our comprehensive platform provides all the tools and features you need to find the
              perfect match, whether you're looking for talent or opportunities.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ready to Get Started?
            </h3>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <Link
                  href="/register"
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center block"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/login"
                  className="w-full border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-center block"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Welcome back! Continue your journey:</p>
                <Link
                  href="/dashboard"
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center block"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
