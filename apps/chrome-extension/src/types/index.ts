export * from '@smartFill/types';

export interface UserProfile {
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
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
  requiredDocuments: Array<any>;
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
