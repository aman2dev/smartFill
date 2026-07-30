import { Router } from 'express';
import { handleExtractRecipe } from '../controllers/recipe.controller.js';

const router: Router = Router();

router.post('/extract-recipe', handleExtractRecipe);

export default router;
