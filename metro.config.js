const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v4 requiere este wrapper para procesar Tailwind en Metro
module.exports = withNativeWind(config, { input: "./global.css" });
