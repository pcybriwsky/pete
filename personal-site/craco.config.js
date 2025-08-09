module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable tree shaking for problematic modules
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        sideEffects: false,
        usedExports: false,
      };

      // Ensure Shader Park and related modules are not tree-shaken
      webpackConfig.module.rules.push({
        test: /node_modules\/(shader-park|@shader-park)/,
        sideEffects: true,
      });

      // Add fallbacks for Node.js modules that might be missing
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      return webpackConfig;
    },
  },
}; 