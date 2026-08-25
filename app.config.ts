import type { ExpoConfig } from "expo/config";

const BRAND_RED = "#C91923";

const config: ExpoConfig = {
  name: "PotentialPeak",
  slug: "potential-peak",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/potentialpeak_logo.jpg",
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
        "PotentialPeak accesses your photo library when you pick an existing meal photo to save in the app.",
    },
  },
  android: {
    package: "com.exo.fitness",
    // Local API is http://192.168.x.x — without this, Android blocks cleartext
    // and auth shows a generic "Network request failed".
    // Expo's Android type omits this Manifest flag; prebuild still honors it.
    usesCleartextTraffic: true,
    adaptiveIcon: {
      // potentialpeak_logo.jpg, inset so the figure survives circle masks.
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundColor: BRAND_RED,
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    // Reinstall was restoring the quiz draft (and jumping to the paywall).
    allowBackup: false,
  } as ExpoConfig["android"],
  web: {
    output: "server",
    favicon: "./assets/images/potentialpeak_logo.jpg",
  },
  plugins: [
    "./plugins/with-arm64-only",
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
        backgroundColor: "#C91923",
        resizeMode: "contain",
        imageWidth: 128,
        dark: {
          image: "./assets/images/splash-icon.png",
          backgroundColor: "#C91923",
        },
      },
    ],
    "expo-font",
    [
      "expo-image-picker",
      {
        cameraPermission:
          "Exo uses the camera so you can photograph meals for calorie and macro estimates.",
        photosPermission:
          "Exo accesses your photo library when you pick an existing meal photo to save in the app.",
      },
    ],
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
    // Crash reporting uses EXPO_PUBLIC_SENTRY_DSN. eas.json sets
    // SENTRY_DISABLE_AUTO_UPLOAD so preview builds don't fail without
    // SENTRY_AUTH_TOKEN.
    "@sentry/react-native/expo",
  ],
  experiments: {
    typedRoutes: false,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "d567a3d2-3740-45f5-80e5-0bad5d380d65",
    },
  },
};

export default config;
