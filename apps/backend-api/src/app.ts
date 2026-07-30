import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(routes);

export default app;
