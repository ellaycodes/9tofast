const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("cjs");
config.resolver.assetExts.push("cjs", "db", "json", "ttf", "otf");
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
