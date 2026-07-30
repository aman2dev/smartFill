import { Router } from 'express';
import { handleExtractDocument } from '../controllers/document.controller.js';

const router: Router = Router();

router.post('/extract-document', handleExtractDocument);

export default router;
