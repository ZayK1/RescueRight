
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (async () => {
  // Get the default Metro configuration
  const config = await getDefaultConfig(__dirname);

  // Force Metro to resolve (sub)dependencies of `three` to `three` itself
  config.resolver.extraNodeModules = {
    three: path.resolve(__dirname, 'node_modules/three'),
  };

  // Add support for 3D model assets
  config.resolver.assetExts.push('glb', 'gltf');

  return config;
})();
