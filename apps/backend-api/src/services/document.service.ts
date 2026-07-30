import { db } from '@smartFill/db';
import { extractDocumentWithAI } from './ai.service.js';
import type { ExtractDocumentRequest, ExtractDocumentResponse } from '@smartFill/types';

export interface DocumentServiceResult {
  statusCode: number;
  data?: ExtractDocumentResponse;
  error?: string;
  code?: string;
}

export const extractDocumentService = async (
  payload: ExtractDocumentRequest
): Promise<DocumentServiceResult> => {
  const { fileBase64, mimeType, userId } = payload;

  if (!fileBase64) {
    return {
      statusCode: 400,
      error: 'Missing fileBase64 parameter.',
      code: 'INVALID_REQUEST'
    };
  }

  let remainingCredits = 50;

  // 1. Check user credit balance if userId provided
  if (userId) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      if (user.credits <= 0) {
        return {
          statusCode: 402,
          error: 'Insufficient credits. Please topup your account.',
          code: 'OUT_OF_CREDITS'
        };
      }
      remainingCredits = user.credits;
    }
  }

  // 2. Perform AI extraction
  const aiResult = await extractDocumentWithAI(fileBase64, mimeType || 'application/pdf');

  // 3. Deduct credit if userId provided
  if (userId) {
    try {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      });
      remainingCredits = updatedUser.credits;
    } catch (err) {
      console.warn('[User Credit update error]', err);
    }
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      extractedProfile: aiResult.extractedProfile,
      extractedFields: aiResult.extractedFields,
      rawText: aiResult.rawText,
      remainingCredits
    }
  };
};
