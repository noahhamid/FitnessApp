import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export type NotificationPermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "unavailable";

function mapStatus(
  status: Notifications.PermissionStatus,
): NotificationPermissionStatus {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

/**
 * Centralize notification (and later camera/health) permission state.
 * Notifications only for Stage 1 — request via `requestNotifications()`.
 */
export function usePermissions() {
  const [status, setStatus] =
    useState<NotificationPermissionStatus>("undetermined");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (Platform.OS === "web") {
      setStatus("unavailable");
      setLoading(false);
      return "unavailable" as const;
    }
    try {
      const current = await Notifications.getPermissionsAsync();
      const mapped = mapStatus(current.status);
      setStatus(mapped);
      return mapped;
    } catch {
      setStatus("unavailable");
      return "unavailable" as const;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      setStatus("unavailable");
      return false;
    }
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) {
        setStatus("granted");
        return true;
      }
      // Already denied — OS won't show the prompt again; caller can deep-link later.
      if (current.status === "denied" && !current.canAskAgain) {
        setStatus("denied");
        return false;
      }
      const result = await Notifications.requestPermissionsAsync();
      const mapped = mapStatus(result.status);
      setStatus(mapped);
      return mapped === "granted";
    } catch {
      setStatus("unavailable");
      return false;
    }
  }, []);

  return {
    notifications: status,
    granted: status === "granted",
    denied: status === "denied",
    loading,
    refresh,
    requestNotifications,
  };
}
