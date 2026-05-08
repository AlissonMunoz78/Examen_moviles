module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      // react-native-reanimated debe ir siempre de ÚLTIMO
      "react-native-reanimated/plugin"
    ]
  };
};
