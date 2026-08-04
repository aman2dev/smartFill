import { ai } from '../config/gemini.js';
import { config } from '../config/env.js';
import type { ExamRecipe, StudentProfile, ExtractedField } from '@smartFill/types';

export const getFallbackRecipe = (domain: string): ExamRecipe => ({
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

export const parseFormWithAI = async (
  domain: string,
  htmlSnippet?: string
): Promise<ExamRecipe> => {
  if (!config.geminiApiKey || !htmlSnippet) {
    return getFallbackRecipe(domain);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert Web Form Parser for Government Application portals.
Analyze this HTML snippet from website domain (${domain}):

\`\`\`html
${htmlSnippet.slice(0, 15000)}
\`\`\`

Task: Inspect every <input>, <select>, <textarea> in the HTML tree and generate exact CSS selectors (e.g. "#txt_candidate_name", "input[name='email']", "select#gender") mapped to standard profile JSON keys:
- full_name (Candidate / Applicant Name)
- father_name (Father's Name)
- mother_name (Mother's Name)
- dob (Date of Birth)
- gender (Gender / Sex)
- category (Community / Caste Category)
- aadhaar_no (Aadhaar Number / Unique ID)
- email (Email Address - NOT OTP input)
- phone (Mobile Number - NOT OTP input)
- address (Permanent / Correspondence Address)
- city (City / District)
- state (State)
- pincode (Pin Code / Zip)
- panCard (PAN Card Number)
- accountNumber (Bank Account Number)
- ifscCode (Bank IFSC Code)

CRITICAL AI SELECTOR RULES:
1. "selector": Construct simple, clean, standard W3C CSS selectors supported natively by browser document.querySelector (e.g. "#inputId", "input[name='attrName']", "input[placeholder*='DD/MM/YYYY']", "input[name*='dob' i]"). NEVER output non-standard jQuery pseudo-selectors like ":contains()" or ":has()", and NEVER output fragile deep DOM tree paths like "div > div:nth-child(7)".
2. "is_verify": Set to true IF the field is a verification/confirmation field (e.g., "Verify Candidate Name", "Confirm Password/Email"). Set false for primary fields.
3. DO NOT map OTP fields (e.g. "Enter OTP Received on Email", "Mobile OTP"). Skip OTP fields completely.

Return strictly valid JSON in this structure:
{
  "formTitle": "Detected Form Title (e.g., BPSC Registration Form)",
  "mappings": [
    { 
      "selector": "#candidate_name_input",
      "match_label": "Candidate Name (परीक्षार्थी का नाम)",
      "profile_key": "full_name",
      "is_verify": false,
      "strategy": "css_selector"
    },
    { 
      "selector": "#verify_candidate_name_input",
      "match_label": "Verify Candidate Name",
      "profile_key": "full_name",
      "is_verify": true,
      "strategy": "css_selector"
    }
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
      console.log('[Gemini Form Mappings]:', JSON.stringify(parsed.mappings, null, 2));
      return {
        id: `recipe-${Date.now()}`,
        domain,
        formTitle: parsed.formTitle || `${domain} Form`,
        version: 1,
        mappings: parsed.mappings || []
      };
    }
  } catch (aiErr) {
    console.error('[Gemini AI Parsing Fallback triggered]', aiErr);
  }

  return getFallbackRecipe(domain);
};

export interface AIDocumentResult {
  extractedProfile: Partial<StudentProfile>;
  extractedFields: ExtractedField[];
  rawText?: string;
}

export const extractDocumentWithAI = async (
  base64Data: string,
  mimeType: string = 'application/pdf'
): Promise<AIDocumentResult> => {
  if (!config.geminiApiKey) {
    return {
      extractedProfile: {},
      extractedFields: [],
      rawText: 'Gemini API key is not configured.'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: `Extract user details from this document (ID card, certificate, marksheet, or identity document).
Return strictly JSON in the following schema:
{
  "extractedProfile": {
    "full_name": "Full Name",
    "father_name": "Father Name",
    "mother_name": "Mother Name",
    "dob": "YYYY-MM-DD or DD/MM/YYYY",
    "gender": "Male" | "Female" | "Other",
    "category": "General" | "OBC" | "SC" | "ST" | "EWS",
    "email": "user@example.com",
    "phone": "9876543210",
    "aadhaar_no": "1234 5678 9012",
    "pan_no": "ABCDE1234F",
    "address": "Full Address",
    "city": "City",
    "town": "Town",
    "state": "State",
    "pincode": "110001"
  },
  "extractedFields": [
    {
      "key": "full_name",
      "label": "Full Name",
      "value": "Extracted Value",
      "confidence": 0.95,
      "category": "personal"
    }
  ],
  "rawText": "Brief extracted raw text summary"
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

      console.log("[Gemini Document Extraction Fallback]", resText)
      return {
        extractedProfile: parsed.extractedProfile || {},
        extractedFields: parsed.extractedFields || [],
        rawText: parsed.rawText || resText

      };
    }

    return {
      extractedProfile: {},
      extractedFields: [],
      rawText: resText

    };
  } catch (err: any) {
    console.error('[Gemini Document Extraction Error]', err);
    throw err;
  }
};
