import { Router } from 'express';
import recipeRoutes from './recipe.routes.js';
import documentRoutes from './document.routes.js';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import queueRoutes from './queue.routes.js';

const router: Router = Router();

router.use('/', healthRoutes);
router.use('/', queueRoutes);
router.use('/api/v1', recipeRoutes);
router.use('/api/v1', documentRoutes);
router.use('/api/v1', authRoutes);

export default router;
