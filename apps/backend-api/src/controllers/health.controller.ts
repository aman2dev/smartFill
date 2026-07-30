import { Request, Response } from 'express';

export const handleHealthCheck = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'backend-api',
    timestamp: new Date().toISOString()
  });
};
