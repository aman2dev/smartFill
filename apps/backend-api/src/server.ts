import server from './app.js';
import { config } from './config/env.js';

server.listen(Number(config.port), '0.0.0.0', () => {
  console.log(`⚡ [smartFill Backend API] Server running on http://0.0.0.0:${config.port}`);
});
