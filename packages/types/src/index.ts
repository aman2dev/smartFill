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

export interface FileUploadRule {
  docType: 'photo' | 'signature' | 'aadhaar' | 'marksheet' | 'pan' | 'other';
  selector: string;
  match_label?: string;
  minKb?: number;
  maxKb?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'pdf';
}

export interface StoredDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileType: FileType;
  sizeBytes: number;
  dataUrl?: string;
  optimizedDataUrl?: string;
  optimizedSizeBytes?: number;
  targetRange?: { minKb: number; maxKb: number };
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
  signature_base64?: string;
  marital_status?: 'Unmarried' | 'Married' | 'Single' | string;
  nationality?: string;
  identification_mark?: string;
  is_ex_serviceman?: boolean | 'No' | 'Yes';
  is_debarred?: boolean | 'No' | 'Yes';
  has_criminal_case?: boolean | 'No' | 'Yes';
  is_pwd?: boolean | 'No' | 'Yes';
  is_departmental?: boolean | 'No' | 'Yes';
}

export interface MissingMandatoryField {
  label: string;
  id?: string;
  name?: string;
  type?: string;
  selector?: string;
}

export interface FormFillResult {
  fillCount: number;
  safeDefaultsCount: number;
  missingMandatory: MissingMandatoryField[];
}

export interface RecipeMapping {
  match_label: string;
  profile_key: keyof StudentProfile | string;
  is_verify?: boolean;
  selector?: string;
  strategy?: 'exact' | 'contains' | 'regex' | 'css_selector';
}

export interface ExamRecipe {
  id: string;
  domain: string;
  formTitle: string;
  mappings: RecipeMapping[];
  fileUploadRules?: FileUploadRule[];
  version: number;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code: string;
}

export interface InteractiveElementSummary {
  id?: string;
  name?: string;
  type?: string;
  tagName: string;
  placeholder?: string;
  nearestText?: string;
  selectorHint?: string;
}

export interface ExtractFormRequest {
  htmlSnippet?: string;
  screenshotBase64?: string;
  elementsSummary?: InteractiveElementSummary[];
  domain: string;
  userId?: string;
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

