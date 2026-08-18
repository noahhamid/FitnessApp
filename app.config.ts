import type { ExpoConfig } from "expo/config";

const BRAND_RED = "#C91923";

const config: ExpoConfig = {
  name: "PotentialPeak",
  slug: "potential-peak",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "com.exo.fitness",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.exo.fitness",
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription:
        "PotentialPeak uses the camera so you can photograph meals for calorie and macro estimates.",
      NSPhotoLibraryUsageDescription:
        "PotentialPeak accesses your photo library when you pick an existing meal photo or progress photo to save in the app.",
    },
  },
  android: {
    package: "com.exo.fitness",
    adaptiveIcon: {
      // potentialpeak_logo.jpg, inset so the figure survives circle masks.
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundColor: BRAND_RED,
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "server",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosClientId:
          "571605491186-kd1lt4933dp1a60hvuvegu2rn9cteodo.apps.googleusercontent.com",
        iosUrlScheme:
          "com.googleusercontent.apps.571605491186-kd1lt4933dp1a60hvuvegu2rn9cteodo",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 180,
        resizeMode: "contain",
        backgroundColor: "#C91923",
        dark: {
          backgroundColor: "#C91923",
        },
      },
    ],
    "expo-font",
    [
      "expo-notifications",
      {
        color: "#E53935",
        defaultChannel: "meal-workout-reminders",
      },
    ],
    // HTTP cleartext only for local/dev and non-production EAS profiles
    // (LAN API). Store builds must use HTTPS (Vercel).
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: process.env.EAS_BUILD_PROFILE !== "production",
        },
      },
    ],
    // Native crash hooks + source-map upload wiring for @sentry/react-native.
    "@sentry/react-native/expo",
  ],
  experiments: {
    typedRoutes: false,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "29eab73d-563f-4778-948f-acf4cf2e0245",
    },
  },
};

export default config;
