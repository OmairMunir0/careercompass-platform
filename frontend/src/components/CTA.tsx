import { useAuthStore } from "@/store/authStore";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="bg-purple-600 text-white py-16">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join Thousands of Successful Connections
        </h2>
        <p className="text-xl mb-8 text-purple-100">
          Don't wait – your perfect match is just a click away.
        </p>

        {!isAuthenticated && (
          <Link
            href="/register"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center"
          >
            Start Your Journey Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        )}
      </div>
    </section>
  );
}
