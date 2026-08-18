const { withGradleProperties } = require("expo/config-plugins");

/** Sideload APKs only need 64-bit ARM. Skip x86 / armeabi-v7a copies. */
function withArm64Only(config) {
  return withGradleProperties(config, (config) => {
    const items = config.modResults;
    const next = {
      type: "property",
      key: "reactNativeArchitectures",
      value: "arm64-v8a",
    };
    const idx = items.findIndex(
      (item) => item.type === "property" && item.key === "reactNativeArchitectures",
    );
    if (idx >= 0) items[idx] = next;
    else items.push(next);
    return config;
  });
}

module.exports = withArm64Only;
