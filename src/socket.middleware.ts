import { createProxyMiddleware } from 'http-proxy-middleware';

export function socketMiddleware() {
  console.log('Came here .....');

  return createProxyMiddleware({
    target: `ws://${process.env.DOMAIN}`, // Change this to your actual WebSocket server URL
    ws: false,
    changeOrigin: true,
  });
}
