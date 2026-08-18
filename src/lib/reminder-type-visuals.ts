import type { ComponentType } from "react";
import {
  Coffee,
  Cookie,
  Dumbbell,
  Moon,
  UtensilsCrossed,
  type LucideProps,
} from "lucide-react-native";
import type { AppTheme } from "@/src/theme";
import type { NotificationHistoryType } from "@/src/lib/notification-history";

/**
 * Icon map + semantic colors for reminder types (workout / breakfast /
 * lunch / dinner). Snack is the extra reminder slot.
 */
export const REMINDER_TYPE_ICON: Record<
  NotificationHistoryType,
  ComponentType<LucideProps>
> = {
  workout: Dumbbell,
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  dinner: Moon,
  snack: Cookie,
};

const MEAL_SEMANTIC = {
  breakfast: {
    light: {
      bg: "rgba(232,140,60,0.16)",
      border: "rgba(232,140,60,0.32)",
      icon: "#D4842A",
    },
    dark: {
      bg: "rgba(255,170,80,0.20)",
      border: "rgba(255,170,80,0.36)",
      icon: "#FFB35C",
    },
  },
  lunch: {
    light: {
      bg: "rgba(46,150,90,0.14)",
      border: "rgba(46,150,90,0.30)",
      icon: "#2A8F52",
    },
    dark: {
      bg: "rgba(80,220,140,0.18)",
      border: "rgba(80,220,140,0.34)",
      icon: "#5EE09A",
    },
  },
  dinner: {
    light: {
      bg: "rgba(80,90,190,0.14)",
      border: "rgba(80,90,190,0.30)",
      icon: "#4A55B0",
    },
    dark: {
      bg: "rgba(130,145,255,0.18)",
      border: "rgba(130,145,255,0.34)",
      icon: "#9AA6FF",
    },
  },
  snack: {
    light: {
      bg: "rgba(200,120,90,0.14)",
      border: "rgba(200,120,90,0.30)",
      icon: "#C4784A",
    },
    dark: {
      bg: "rgba(255,180,140,0.18)",
      border: "rgba(255,180,140,0.34)",
      icon: "#FFB48A",
    },
  },
} as const;

export type ReminderWellColors = { bg: string; border: string; icon: string };

export function reminderTypeWellColors(
  type: NotificationHistoryType,
  resolved: "light" | "dark",
  T: AppTheme,
): ReminderWellColors {
  if (type === "workout") {
    return {
      bg: T.accentTint,
      border: T.accentLine,
      icon: T.accent,
    };
  }
  return MEAL_SEMANTIC[type][resolved];
}
