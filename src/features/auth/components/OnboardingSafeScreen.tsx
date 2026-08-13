import {
  useOnboardingColors,
  useSystemResolvedScheme,
} from "@/src/ui/tokens";
import { StatusBar } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  edges?: Edge[];
};

/** Shared shell: system-themed bg + status bar for onboarding question screens. */
export function OnboardingSafeScreen({
  children,
  edges = ["top", "bottom"],
}: Props) {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={edges}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />
      {children}
    </SafeAreaView>
  );
}
