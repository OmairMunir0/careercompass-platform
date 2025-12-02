import axiosInstance from "@/lib/axiosInstance";

interface CheckoutSessionPayload {
  successUrl?: string;
  cancelUrl?: string;
}

export const billingService = {
  createCheckoutSession: async (payload: CheckoutSessionPayload) => {
    const response = await axiosInstance.post("/payments/checkout-session", payload);
    return response.data;
  },

  confirmCheckoutSession: async (sessionId: string) => {
    const response = await axiosInstance.post("/payments/confirm-session", { sessionId });
    return response.data;
  },
};

