"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { billingService } from "@/services/billingService";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Status = "idle" | "confirming" | "success" | "error";

const BillingSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  useEffect(() => {
    if (status !== "idle") return;

    if (!sessionId) {
      setErrorMessage("Missing checkout session identifier.");
      setStatus("error");
      return;
    }

    const confirmSession = async () => {
      setStatus("confirming");
      try {
        const response = await billingService.confirmCheckoutSession(sessionId);
        const safeUser = response?.data;
        if (safeUser) {
          setUser(safeUser);
          setRole(safeUser.role);
        }
        setStatus("success");
        toast.success("Premium activated! Enjoy your expanded posting limits.");
      } catch (error: any) {
        const message = error?.response?.data?.message || "Unable to confirm payment.";
        setErrorMessage(message);
        toast.error(message);
        setStatus("error");
      }
    };

    confirmSession();
  }, [sessionId, status, setUser, setRole]);

  const renderContent = () => {
    if (status === "confirming" || status === "idle") {
      return (
        <>
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Confirming your payment...</p>
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <p className="text-red-600 font-semibold mb-2">We couldn't verify your payment.</p>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <Link href="/timeline" className="text-blue-600 hover:underline">
            Return to Timeline
          </Link>
        </>
      );
    }

    return (
      <>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful 🎉</h1>
        <p className="text-gray-600 mb-4">
          Your account has been upgraded to Premium. You can now post up to 2,500 characters on the
          timeline.
        </p>
        <Link href="/timeline" className="text-blue-600 hover:underline">
          Back to Timeline
        </Link>
      </>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">{renderContent()}</div>
    </div>
  );
};

export default BillingSuccessPage;

