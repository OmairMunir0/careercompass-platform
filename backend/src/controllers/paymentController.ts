import { Request, Response } from "express";
import Stripe from "stripe";
import { User } from "../models/User";
import { isSubscriptionActive } from "../utils/subscription";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
const frontendBaseUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "http://localhost:3000";
const subscriptionDurationDays = Number(process.env.PREMIUM_SUBSCRIPTION_DAYS ?? 30);
const dayInMs = 24 * 60 * 60 * 1000;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

const missingStripeConfigMessage =
  "Payment processor not configured. Please set STRIPE_SECRET_KEY and STRIPE_PREMIUM_PRICE_ID.";

const withSessionPlaceholder = (url: string): string =>
  url.includes("?") ? `${url}&session_id={CHECKOUT_SESSION_ID}` : `${url}?session_id={CHECKOUT_SESSION_ID}`;

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!stripe || !premiumPriceId) {
      return res.status(500).json({ message: missingStripeConfigMessage });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isSubscriptionActive(user)) {
      return res
        .status(400)
        .json({ message: "You already have an active Premium subscription." });
    }

    const successUrlBase = req.body?.successUrl || `${frontendBaseUrl}/billing/success`;
    const cancelUrl = req.body?.cancelUrl || `${frontendBaseUrl}/billing/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: premiumPriceId, quantity: 1 }],
      success_url: withSessionPlaceholder(successUrlBase),
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        userId: user._id.toString(),
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
        },
      },
    });

    user.stripeCheckoutSessionId = session.id;
    await user.save();

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ message: error.message || "Unable to start checkout session" });
  }
};

export const confirmCheckoutSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!stripe) return res.status(500).json({ message: missingStripeConfigMessage });

    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (!session) return res.status(404).json({ message: "Checkout session not found" });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed yet" });
    }

    const metadataUserId =
      session.metadata?.userId ||
      (typeof session.subscription !== "string"
        ? session.subscription?.metadata?.userId
        : undefined) ||
      req.user.id;

    const user = await User.findById(metadataUserId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const baseDate =
      user.premiumExpiresAt && user.premiumExpiresAt.getTime() > now.getTime()
        ? user.premiumExpiresAt
        : now;
    const expiresAt = new Date(baseDate.getTime() + subscriptionDurationDays * dayInMs);

    user.subscriptionTier = "premium";
    user.subscriptionStatus = "active";
    user.premiumExpiresAt = expiresAt;
    user.lastPaymentAt = now;
    user.stripeCheckoutSessionId = session.id;
    user.stripeCustomerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer as Stripe.Customer)?.id ?? null;
    user.stripeSubscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id ?? null;

    await user.save();

    const populatedUser = await user.populate<{ roleId: { name: string } }>("roleId", "name");

    const safeUser = {
      ...populatedUser.toObject(),
      passwordHash: undefined,
      role: (populatedUser.roleId as any)?.name,
      isPremiumActive: true,
    };

    return res.status(200).json({
      message: "Premium subscription activated",
      data: safeUser,
    });
  } catch (error: any) {
    console.error("Stripe confirmation error:", error);
    return res.status(500).json({ message: error.message || "Unable to confirm payment" });
  }
};

