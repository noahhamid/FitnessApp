module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    // THIS IS THE CRITICAL PART
    plugins: [
      'react-native-reanimated/plugin', 
    ],
  };
};