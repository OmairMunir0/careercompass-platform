import { IUser } from "../models/User";

export const FREE_CHARACTER_LIMIT = 250;
export const PREMIUM_CHARACTER_LIMIT = 2500;

export const isSubscriptionActive = (user?: IUser | null): boolean => {
  if (!user) return false;
  if (user.subscriptionTier !== "premium") return false;
  if (user.subscriptionStatus !== "active") return false;

  if (user.premiumExpiresAt && user.premiumExpiresAt.getTime() < Date.now()) {
    return false;
  }

  return true;
};

export const getCharacterLimitForUser = (user?: IUser | null): number =>
  isSubscriptionActive(user) ? PREMIUM_CHARACTER_LIMIT : FREE_CHARACTER_LIMIT;

/**
 * Ensures subscription status is up to date when a premium period has lapsed.
 */
export const syncSubscriptionStatus = async (user: IUser): Promise<IUser> => {
  if (
    user.subscriptionTier === "premium" &&
    user.premiumExpiresAt &&
    user.premiumExpiresAt.getTime() < Date.now()
  ) {
    user.subscriptionTier = "free";
    user.subscriptionStatus = "expired";
    user.premiumExpiresAt = null;
    await user.save();
  }

  return user;
};

