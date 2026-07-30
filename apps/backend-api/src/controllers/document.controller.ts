import { Request, Response } from 'express';
import { extractDocumentService } from '../services/document.service.js';
import type { ExtractDocumentRequest, ExtractDocumentResponse, APIErrorResponse } from '@smartFill/types';

export const handleExtractDocument = async (
  req: Request<{}, {}, ExtractDocumentRequest>,
  res: Response<ExtractDocumentResponse | APIErrorResponse>
) => {
  try {
    const result = await extractDocumentService(req.body);

    if (result.error || !result.data) {
      return res.status(result.statusCode).json({
        success: false,
        error: result.error || 'Failed to extract document',
        code: result.code || 'UNKNOWN_ERROR'
      });
    }

    return res.status(result.statusCode).json(result.data);
  } catch (err: any) {
    console.error('[Document Controller Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};
