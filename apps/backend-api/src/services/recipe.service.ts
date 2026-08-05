import { db } from '@smartFill/db';
import { parseFormWithAI } from './ai.service.js';
import type { 
  ExtractFormRequest, 
  ExtractFormResponse, 
  RecipeMapping, 
  ExamRecipe 
} from '@smartFill/types';

export interface ServiceResult {
  statusCode: number;
  data?: ExtractFormResponse;
  error?: string;
  code?: string;
}

export const extractRecipeService = async (
  payload: ExtractFormRequest
): Promise<ServiceResult> => {
  const { htmlSnippet, domain, userId } = payload;

  if (!domain) {
    return {
      statusCode: 400,
      error: 'Missing domain parameter.',
      code: 'INVALID_REQUEST'
    };
  }

  // 1. Check user credit balance if userId provided
  let remainingCredits = 50;
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

  // 2. Check Database Cache for existing recipe
  const cached = await db.recipeCache.findUnique({
    where: { domain }
  });

  if (cached) {
    const parsedMappings = cached.mappingsJson as unknown as RecipeMapping[];
    const hasValidSelectors = Array.isArray(parsedMappings) && parsedMappings.some((m) => !!m.selector || m.strategy === 'css_selector');
    const hasInvalidSelectors = Array.isArray(parsedMappings) && parsedMappings.some((m) => 
      !m.selector ||
      m.selector.includes('nth-child') || 
      m.selector.includes('nth-of-type') ||
      m.selector.includes(':contains') ||
      m.selector.includes(':has(') ||
      (m.selector.startsWith('#') && /^#\d+$/.test(m.selector))
    );

    if (hasValidSelectors && !hasInvalidSelectors) {
      console.log(`[Cache Hit] Serving selector-enhanced cached recipe for domain: ${domain}`);
      return {
        statusCode: 200,
        data: {
          success: true,
          domain: cached.domain,
          cached: true,
          recipe: {
            id: cached.id,
            domain: cached.domain,
            formTitle: cached.formTitle,
            version: cached.version,
            mappings: parsedMappings
          },
          remainingCredits
        }
      };
    } else {
      console.log(`[Cache Invalidated] Refreshing recipe with invalid/legacy selectors for domain: ${domain}`);
      await db.recipeCache.delete({ where: { domain } }).catch(() => {});
    }
  }

  console.log(`[Cache Miss] Generating recipe via Gemini for domain: ${domain}`);

  // 3. Dynamic Gemini AI Parsing Generation
  const recipe: ExamRecipe = await parseFormWithAI(domain, htmlSnippet);

  // 4. Save newly generated recipe to DB Cache & deduct credit (using upsert to prevent unique constraint conflict)
  try {
    await db.recipeCache.upsert({
      where: { domain },
      update: {
        formTitle: recipe.formTitle,
        mappingsJson: recipe.mappings as any,
        version: { increment: 1 }
      },
      create: {
        domain,
        formTitle: recipe.formTitle,
        mappingsJson: recipe.mappings as any,
        version: 1
      }
    });

    if (userId) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      });
      remainingCredits = updatedUser.credits;
    }
  } catch (dbErr) {
    console.warn('[DB Cache save non-fatal error]', dbErr);
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      domain,
      cached: false,
      recipe,
      remainingCredits
    }
  };
};
