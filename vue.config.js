module.exports = {
  publicPath: './',
  lintOnSave: false,
  devServer: {
    port: 8888,
    open: true,
    proxy: {
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true
      },
      '/product': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/order': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/pay': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/chat': {
        target: 'http://localhost:9000',
        changeOrigin: true
      },
      '/streamQianwen': {
        target: 'http://localhost:9000',
        changeOrigin: true
      },
      '/streamDeepseek': {
        target: 'http://localhost:9000',
        changeOrigin: true
      },
      '/xxl-job-admin': {
        target: 'http://localhost',
        changeOrigin: true
      }
    }
  }
};
