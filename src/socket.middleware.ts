import { createProxyMiddleware } from 'http-proxy-middleware';

export function socketMiddleware() {
  return createProxyMiddleware({
    target: `ws://${process.env.DOMAIN}`, // Change this to your actual WebSocket server URL
    ws: true,
    changeOrigin: true,
  });
}
