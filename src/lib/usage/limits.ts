import { SubscriptionTier } from "@prisma/client";
import { getTierDefaults } from "@/lib/billing/entitlements";

export function getDailyProfileViewLimit(tier: SubscriptionTier) {
  return getTierDefaults(tier).profileViewsDailyLimit;
}

export function getDailyVideoConnectLimit(tier: SubscriptionTier) {
  return getTierDefaults(tier).videoConnectsDailyLimit;
}
