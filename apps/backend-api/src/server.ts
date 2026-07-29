import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from '@smartFill/db';
import type { 
  ExtractFormRequest, 
  ExtractFormResponse, 
  APIErrorResponse, 
  ExamRecipe, 
  RecipeMapping 
} from '@smartFill/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Secure Gemini API Initialization
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Fallback Recipe Generator when AI call or domain recipe is missing
const getFallbackRecipe = (domain: string): ExamRecipe => ({
  id: `fallback-${Date.now()}`,
  domain,
  formTitle: 'Standard Government Form Fallback',
  version: 1,
  mappings: [
    { match_label: 'Candidate Name', profile_key: 'full_name', is_verify: false },
    { match_label: 'Verify Candidate Name', profile_key: 'full_name', is_verify: true },
    { match_label: 'Father Name', profile_key: 'father_name', is_verify: false },
    { match_label: 'Verify Candidate Father Name', profile_key: 'father_name', is_verify: true },
    { match_label: 'Mother Name', profile_key: 'mother_name', is_verify: false },
    { match_label: 'Verify Candidate Mother Name', profile_key: 'mother_name', is_verify: true },
    { match_label: 'Gender', profile_key: 'gender', is_verify: false },
    { match_label: 'Verify Gender', profile_key: 'gender', is_verify: true },
    { match_label: 'Aadhaar', profile_key: 'aadhaar_no', is_verify: false },
    { match_label: 'Address', profile_key: 'address', is_verify: false },
    { match_label: 'City', profile_key: 'city', is_verify: false }
  ]
});

/**
 * POST /api/v1/extract-recipe
 * 1. Checks user credits
 * 2. Checks database cache for existing domain mapping
 * 3. On cache miss: Calls Gemini 2.5 Flash to parse HTML inputs and map to StudentProfile keys
 * 4. Deducts 1 credit and caches recipe in DB
 */
app.post(
  '/api/v1/extract-recipe',
  async (
    req: Request<{}, {}, ExtractFormRequest>,
    res: Response<ExtractFormResponse | APIErrorResponse>
  ) => {
    try {
      const { htmlSnippet, domain, userId } = req.body;

      if (!domain) {
        return res.status(400).json({
          success: false,
          error: 'Missing domain parameter.',
          code: 'INVALID_REQUEST'
        });
      }

      // 1. Check user credit balance if userId provided
      let remainingCredits = 50;
      if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user) {
          if (user.credits <= 0) {
            return res.status(402).json({
              success: false,
              error: 'Insufficient credits. Please topup your account.',
              code: 'OUT_OF_CREDITS'
            });
          }
          remainingCredits = user.credits;
        }
      }

      // 2. Check Database Cache for existing recipe
      const cached = await db.recipeCache.findUnique({
        where: { domain }
      });

      if (cached) {
        console.log(`[Cache Hit] Serving cached recipe for domain: ${domain}`);
        const parsedMappings = cached.mappingsJson as unknown as RecipeMapping[];
        return res.json({
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
        });
      }

      console.log(`[Cache Miss] Generating recipe via Gemini for domain: ${domain}`);

      // 3. Dynamic Gemini AI Parsing Generation
      let recipe: ExamRecipe;
      try {
        if (geminiApiKey && htmlSnippet) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Analyze this HTML snippet from an application form domain (${domain}):
${htmlSnippet.slice(0, 4000)}

Map form input labels to standard StudentProfile JSON keys: 
- full_name
- father_name
- mother_name
- gender
- category
- aadhaar_no
- address
- city
- town

Return JSON matching:
{
  "formTitle": "Form Title",
  "mappings": [
    { "match_label": "Field Label", "profile_key": "full_name", "is_verify": false }
  ]
}`
                  }
                ]
              }
            ]
          });

          const resText = response.text || '';
          const jsonStart = resText.indexOf('{');
          const jsonEnd = resText.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const parsed = JSON.parse(resText.substring(jsonStart, jsonEnd + 1));
            recipe = {
              id: `recipe-${Date.now()}`,
              domain,
              formTitle: parsed.formTitle || `${domain} Form`,
              version: 1,
              mappings: parsed.mappings || []
            };
          } else {
            recipe = getFallbackRecipe(domain);
          }
        } else {
          recipe = getFallbackRecipe(domain);
        }
      } catch (aiErr) {
        console.error('[Gemini AI Fallback triggered]', aiErr);
        recipe = getFallbackRecipe(domain);
      }

      // 4. Save newly generated recipe to DB Cache & deduct credit
      try {
        await db.recipeCache.create({
          data: {
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

      return res.json({
        success: true,
        domain,
        cached: false,
        recipe,
        remainingCredits
      });

    } catch (err: any) {
      console.error('[API Server Error]', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend-api', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`⚡ [smartFill Backend API] Server running on http://localhost:${PORT}`);
});
