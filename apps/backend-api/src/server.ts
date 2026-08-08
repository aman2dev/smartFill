import server from './app.js';
import { config } from './config/env.js';

server.listen(config.port, () => {
  console.log(`⚡ [smartFill Backend API] Server running on http://localhost:${config.port}`);
});
