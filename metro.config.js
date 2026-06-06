const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

// Prefer Zustand's CJS builds (process.env.NODE_ENV) over ESM (import.meta.env),
// which breaks Expo web entry scripts that are not loaded as ES modules.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "zustand" || moduleName.startsWith("zustand/")) {
    try {
      return {
        filePath: require.resolve(moduleName),
        type: "sourceFile",
      };
    } catch {
      // Fall through to Metro's default resolver.
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
