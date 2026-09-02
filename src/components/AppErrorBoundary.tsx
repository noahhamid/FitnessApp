import { Component, useEffect, type ErrorInfo, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { TriangleAlert } from "lucide-react-native";
import {
  FONTS,
  getOnboardingColors,
  type OnboardingColors,
} from "@/src/ui/tokens";
import { Sentry, sentryEnabled } from "@/src/lib/sentry";

type FallbackProps = {
  error: Error;
  retry: () => void | Promise<void>;
};

/**
 * Recovery screen for a thrown render error.
 *
 * Reads no app context (theme, query client, IAP) and no safe-area insets on
 * purpose — any of those providers can be what threw, so this has to paint
 * without them. Palette comes from the OS scheme instead of ThemeContext.
 */
export function ErrorFallback({ error, retry }: FallbackProps) {
  const scheme = useColorScheme();
  const c = getOnboardingColors(scheme === "dark" ? "dark" : "light");
  const s = makeStyles(c);

  // A crash during the first render leaves the native splash up, which would
  // hide this screen entirely.
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <View style={s.root}>
      <View style={s.badge}>
        <TriangleAlert size={26} color={c.accent} strokeWidth={2.4} />
      </View>

      <Text style={s.title}>Something went wrong</Text>
      <Text style={s.body}>
        This screen ran into an unexpected error. Your workouts, meals, and
        progress are saved.
      </Text>

      <Pressable
        onPress={() => void retry()}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
      >
        <Text style={s.ctaText}>Try again</Text>
      </Pressable>

      {__DEV__ && (
        <ScrollView style={s.debug} contentContainerStyle={s.debugInner}>
          <Text style={s.debugMessage}>{error.message}</Text>
          {error.stack ? <Text style={s.debugStack}>{error.stack}</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Keeps a render error from blanking the whole app. Use it inside the provider
 * tree so retrying re-mounts only the screens, leaving the theme and the React
 * Query cache intact.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (sentryEnabled) {
      Sentry.captureException(error, {
        contexts: {
          react: { componentStack: info.componentStack ?? "" },
        },
      });
      return;
    }
    if (__DEV__) {
      console.error("Unhandled render error:", error, info.componentStack);
    }
  }

  retry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) return <ErrorFallback error={error} retry={this.retry} />;
    return this.props.children;
  }
}

function makeStyles(c: OnboardingColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingVertical: 64,
    },
    badge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      marginBottom: 20,
    },
    title: {
      fontFamily: FONTS.extraBold,
      fontSize: 26,
      letterSpacing: 0.4,
      color: c.text,
      textAlign: "center",
    },
    body: {
      fontFamily: FONTS.regular,
      fontSize: 14,
      lineHeight: 21,
      color: c.muted,
      textAlign: "center",
      marginTop: 10,
      maxWidth: 320,
    },
    cta: {
      marginTop: 28,
      minWidth: 200,
      paddingVertical: 15,
      paddingHorizontal: 32,
      borderRadius: 999,
      backgroundColor: c.accent,
      alignItems: "center",
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaText: {
      fontFamily: FONTS.semiBold,
      fontSize: 15,
      color: c.onAccent,
    },
    debug: {
      alignSelf: "stretch",
      maxHeight: 220,
      marginTop: 28,
      borderRadius: 12,
      backgroundColor: c.bg2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    debugInner: {
      padding: 14,
    },
    debugMessage: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: c.red,
    },
    debugStack: {
      fontFamily: FONTS.regular,
      fontSize: 10,
      lineHeight: 15,
      color: c.muted,
      marginTop: 10,
    },
  });
}
