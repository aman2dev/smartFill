import { GoogleGenAI } from '@google/genai';
import { config } from './env.js';

export const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
