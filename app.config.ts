import type { ExpoConfig } from "expo/config";

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
  },
  android: {
    package: "com.exo.fitness",
    adaptiveIcon: {
      backgroundColor: "#C91923",
      foregroundImage: "./assets/images/android-icon-foreground.png",
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
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#C91923",
        dark: {
          backgroundColor: "#C91923",
        },
      },
    ],
    "expo-font",
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