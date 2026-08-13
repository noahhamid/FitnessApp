import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../services/profile.service";

/**
 * Full UserProfile row (injuries, focus areas, equipment…).
 *
 * Separate from `useProfile` in the auth feature, which returns the narrow
 * onboarding `ProfileMetrics` shape. Keyed under the same `["user", "profile"]`
 * prefix so existing refresh invalidations still reach it.
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile", "full"] as const,
    queryFn: fetchUserProfile,
  });
}
