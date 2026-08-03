module.exports = {
  publicPath: './',
  lintOnSave: false,
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/product': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/order': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/xxl-job-admin': {
        target: 'http://localhost',
        changeOrigin: true
      }
    }
  }
};
