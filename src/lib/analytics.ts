export type AnalyticsEvent =
  | "app_opened"
  | "wallet_connected"
  | "lesson_started"
  | "exercise_answered"
  | "lesson_completed"
  | "badge_unlocked"
  | "badge_minted"
  | "crc_reward_claimed"
  | "referral_link_copied"
  | "referred_wallet_connected";

// MVP: log only. Swap for a real sink (Supabase, etc.) later.
export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.debug("[analytics]", event, props ?? {});
}
