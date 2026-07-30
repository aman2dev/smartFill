import { Request, Response } from 'express';
import { extractRecipeService } from '../services/recipe.service.js';
import type { ExtractFormRequest, ExtractFormResponse, APIErrorResponse } from '@smartFill/types';

export const handleExtractRecipe = async (
  req: Request<{}, {}, ExtractFormRequest>,
  res: Response<ExtractFormResponse | APIErrorResponse>
) => {
  try {
    const result = await extractRecipeService(req.body);

    if (result.error || !result.data) {
      return res.status(result.statusCode).json({
        success: false,
        error: result.error || 'Failed to extract recipe',
        code: result.code || 'UNKNOWN_ERROR'
      });
    }

    return res.status(result.statusCode).json(result.data);
  } catch (err: any) {
    console.error('[API Server Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};
