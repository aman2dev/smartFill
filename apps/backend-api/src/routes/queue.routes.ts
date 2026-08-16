import { Router } from 'express';
import {
  renderMobileUploadPage,
  handleCustomerUpload,
  handleGetPendingQueue,
  handleConsumeQueueItem
} from '../controllers/queue.controller.js';

const router: Router = Router();

// Public mobile upload webpage served when scanning QR code
router.get('/upload/:operatorId?', renderMobileUploadPage);

// Customer document upload endpoint
router.post('/api/v1/public/queue/upload', handleCustomerUpload);

// Operator queue management endpoints
router.get('/api/v1/queue/pending', handleGetPendingQueue);
router.post('/api/v1/queue/consume', handleConsumeQueueItem);

export default router;
