// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/api', createProxyMiddleware({
    target: 'https://mungo.n-e.kr',   // 실제 백엔드
    changeOrigin: true,
    secure: true,
    xfwd: true,
  }));
};
