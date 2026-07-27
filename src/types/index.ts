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

export type FileType = 'pdf' | 'jpeg' | 'jpg' | 'png';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0 to 100
  category: 'personal' | 'contact' | 'identity' | 'academic';
}

export interface StoredDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileType: FileType;
  sizeBytes: number;
  dataUrl?: string; // base64 or object URL
  uploadDate: string;
  status: 'scanning' | 'processed' | 'error';
  confidenceScore: number;
  extractedFields: ExtractedField[];
  errorDetails?: string;
}

export interface UserProfile {
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string; // YYYY-MM-DD
  age?: number;
  gender: 'Male' | 'Female' | 'Other' | '';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | '';
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  addressLine1: string;
  city: string;
  town?: string;
  state: string;
  pincode: string;
  
  // Academic
  tenthBoard: string;
  tenthRollNo: string;
  tenthPassingYear: string;
  tenthMarksPercentage: string;

  twelfthBoard: string;
  twelfthRollNo: string;
  twelfthPassingYear: string;
  twelfthMarksPercentage: string;

  graduationDegree: string;
  graduationUniversity: string;
  graduationPassingYear: string;
  graduationCgpaPercentage: string;

  // Media
  photoUrl?: string;
  photo_base64?: string;
  signatureUrl?: string;
}

export interface ExamTemplate {
  id: string;
  title: string;
  code: string;
  organization: string;
  deadline: string;
  requiredDocuments: DocumentType[];
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'select' | 'file';
    profileKey: keyof UserProfile;
    options?: string[];
    placeholder?: string;
    required: boolean;
  }[];
}

export interface AutofillLog {
  id: string;
  timestamp: string;
  examName: string;
  totalFields: number;
  filledFields: number;
  durationMs: number;
  usedDocuments: string[];
}
