export function isSubscriptionActive(user: any): boolean {
  if (!user) return false;
  
  // Check if user has premium tier
  if (user.subscriptionTier !== "premium") return false;
  
  // Check subscription status
  if (user.subscriptionStatus !== "active") return false;
  
  // Check if premium hasn't expired
  if (user.premiumExpiresAt) {
    const expiresAt = new Date(user.premiumExpiresAt);
    const now = new Date();
    if (expiresAt < now) return false;
  }
  
  // Also check the isPremiumActive flag if available
  if (user.isPremiumActive !== undefined) {
    return user.isPremiumActive;
  }
  
  return true;
}

