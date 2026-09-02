import type { ExpoConfig } from "expo/config";

const BRAND_RED = "#C91923";

const config: ExpoConfig = {
  name: "Trainplate",
  slug: "trainplate",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/trainplate.jpg",
  scheme: "com.trainplate.app",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.trainplate.app",
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription:
        "Trainplate uses the camera so you can photograph meals for calorie and macro estimates.",
      NSPhotoLibraryUsageDescription:
        "Trainplate accesses your photo library when you pick an existing meal photo to save in the app.",
    },
  },
  android: {
    package: "com.trainplate.app",
    usesCleartextTraffic: true,
    adaptiveIcon: {
      foregroundImage: "./assets/images/trainplate.jpg",
      backgroundColor: BRAND_RED,
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    allowBackup: false,
  } as ExpoConfig["android"],
  web: {
    output: "server",
    favicon: "./assets/images/potentialpeak_logo.jpg",
  },
  // Exercise JPGs (~34MB) load from Cloudinary — keep them off the APK/AAB.
  assetBundlePatterns: [
    "assets/**/*",
    "!assets/images/workout/**",
  ],
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
    "expo-iap",
    [
      "expo-image-picker",
      {
        cameraPermission:
          "Trainplate uses the camera so you can photograph meals for calorie and macro estimates.",
        photosPermission:
          "Trainplate accesses your photo library when you pick an existing meal photo to save in the app.",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "Trainplate uses the camera so you can photograph meals for calorie and macro estimates.",
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      "expo-notifications",
      {
        color: "#E53935",
        defaultChannel: "meal-workout-reminders",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: process.env.EAS_BUILD_PROFILE !== "production",
        },
      },
    ],
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
