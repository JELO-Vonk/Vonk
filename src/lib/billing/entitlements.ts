import { SubscriptionTier } from "@prisma/client";

export type FeatureCode =
  | "profile_views_daily_limit"
  | "video_connects_daily_limit"
  | "can_use_incognito"
  | "can_see_who_liked_you"
  | "advanced_filters_enabled";

export function getTierDefaults(tier: SubscriptionTier) {
  switch (tier) {
    case "PLATINUM":
      return {
        profileViewsDailyLimit: Infinity,
        videoConnectsDailyLimit: Infinity,
        canUseIncognito: true,
        canSeeWhoLikedYou: true,
        advancedFiltersEnabled: true
      };
    case "GOLD":
      return {
        profileViewsDailyLimit: 100,
        videoConnectsDailyLimit: 25,
        canUseIncognito: true,
        canSeeWhoLikedYou: true,
        advancedFiltersEnabled: true
      };
    default:
      return {
        profileViewsDailyLimit: 25,
        videoConnectsDailyLimit: 5,
        canUseIncognito: false,
        canSeeWhoLikedYou: false,
        advancedFiltersEnabled: false
      };
  }
}
