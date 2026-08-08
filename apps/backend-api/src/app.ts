import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { setupWebSocketHandler } from './websocket/wsHandler.js';


const app: Express = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(routes);

const server = createServer(app)

const wss = new WebSocketServer({ server });

setupWebSocketHandler(wss);


export default server 
