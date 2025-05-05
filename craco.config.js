module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          stream: require.resolve('stream-browserify'),
          zlib: require.resolve('browserify-zlib'),
          crypto: require.resolve('crypto-browserify'),
          buffer: require.resolve('buffer/'),
          process: require.resolve('process/browser'),
        },
      },
    },
  },
};