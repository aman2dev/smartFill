/**
 * Shared Type Definitions Contract for smartFill Monorepo
 */

export type DocumentType = 
  | 'Aadhaar Card'
  | '10th Marksheet'
  | '12th Marksheet'
  | 'Degree Certificate'
  | 'Domicile Certificate'
  | 'PAN Card'
  | 'Passport Photo'
  | 'Signature'
  | 'Other Document';

export type FileType = 'pdf' | 'jpeg' | 'jpg' | 'png' | 'webp';

export type GenderType = 'Male' | 'Female' | 'Other' | '';
export type CategoryType = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | '';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  category: 'personal' | 'contact' | 'identity' | 'academic';
}

export interface StoredDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileType: FileType;
  sizeBytes: number;
  dataUrl?: string;
  uploadDate: string;
  status: 'scanning' | 'processed' | 'error';
  confidenceScore: number;
  extractedFields: ExtractedField[];
  errorDetails?: string;
}

export interface StudentProfile {
  full_name: string;
  father_name: string;
  mother_name: string;
  dob?: string;
  gender?: GenderType;
  category?: CategoryType;
  email?: string;
  phone?: string;
  aadhaar_no: string;
  pan_no?: string;
  address: string;
  city: string;
  town?: string;
  state?: string;
  pincode?: string;
  photo_base64?: string;
}

export interface RecipeMapping {
  match_label: string;
  profile_key: keyof StudentProfile;
  is_verify?: boolean;
  strategy?: 'exact' | 'contains' | 'regex';
}

export interface ExamRecipe {
  id: string;
  domain: string;
  formTitle: string;
  mappings: RecipeMapping[];
  version: number;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code: string;
}

export interface ExtractFormRequest {
  htmlSnippet: string;
  domain: string;
  userId: string;
}

export interface ExtractFormResponse {
  success: true;
  domain: string;
  cached: boolean;
  recipe: ExamRecipe;
  remainingCredits: number;
}

export interface UserCreditsResponse {
  userId: string;
  credits: number;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface ExtractDocumentRequest {
  fileBase64: string;
  mimeType: string;
  fileName?: string;
  userId?: string;
}

export interface ExtractDocumentResponse {
  success: true;
  extractedProfile: Partial<StudentProfile>;
  extractedFields: ExtractedField[];
  rawText?: string;
  remainingCredits: number;
}

