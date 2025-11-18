"use client";

import Link from "next/link";

const BillingCancelPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-gray-600 mb-4">
          Your upgrade was cancelled. You can continue using the Free plan or try upgrading again
          anytime.
        </p>
        <Link href="/timeline" className="text-blue-600 hover:underline">
          Back to Timeline
        </Link>
      </div>
    </div>
  );
};

export default BillingCancelPage;

