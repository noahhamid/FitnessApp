module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Web bundles load as classic scripts (no type="module"), so import.meta
          // from dependencies like zustand must be rewritten for the browser.
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
