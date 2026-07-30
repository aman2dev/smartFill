import type { StoredDocument, UserProfile, ExamTemplate, AutofillLog } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'smartfill_documents',
  PROFILE: 'smartfill_profile',
  LOGS: 'smartfill_logs',
};

export const defaultProfile: UserProfile = {
  fullName: 'Rahul Sharma',
  fatherName: 'Mahesh Sharma',
  motherName: 'Sunita Sharma',
  dob: '2001-08-15',
  gender: 'Male',
  category: 'General',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  aadhaarNumber: '5489 1204 9832',
  panNumber: 'ABCPS8492K',
  addressLine1: 'Flat 402, Green Valley Apartments, MG Road',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  tenthBoard: 'CBSE Board',
  tenthRollNo: '12849031',
  tenthPassingYear: '2017',
  tenthMarksPercentage: '92.4%',
  twelfthBoard: 'CBSE Board',
  twelfthRollNo: '26910482',
  twelfthPassingYear: '2019',
  twelfthMarksPercentage: '88.6%',
  graduationDegree: 'B.Tech Computer Science',
  graduationUniversity: 'Delhi Technological University',
  graduationPassingYear: '2023',
  graduationCgpaPercentage: '8.75',
};

export const sampleDocuments: StoredDocument[] = [
  {
    id: 'doc-aadhaar-1',
    name: 'Aadhaar_Card_Rahul.pdf',
    type: 'Aadhaar Card',
    fileType: 'pdf',
    sizeBytes: 1048576,
    uploadDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'processed',
    confidenceScore: 98,
    extractedFields: [
      { key: 'fullName', label: 'Full Name', value: 'Rahul Sharma', confidence: 99, category: 'personal' },
      { key: 'fatherName', label: "Father's Name", value: 'Mahesh Sharma', confidence: 97, category: 'personal' },
      { key: 'dob', label: 'Date of Birth', value: '2001-08-15', confidence: 99, category: 'personal' },
      { key: 'aadhaarNumber', label: 'Aadhaar Number', value: '5489 1204 9832', confidence: 99, category: 'identity' },
      { key: 'city', label: 'City', value: 'New Delhi', confidence: 96, category: 'contact' },
    ]
  },
  {
    id: 'doc-10th-marksheet',
    name: '10th_CBSE_Marksheet.png',
    type: '10th Marksheet',
    fileType: 'png',
    sizeBytes: 524288,
    uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'processed',
    confidenceScore: 96,
    extractedFields: [
      { key: 'tenthRollNo', label: '10th Roll No', value: '12849031', confidence: 99, category: 'academic' },
      { key: 'tenthPassingYear', label: 'Passing Year', value: '2017', confidence: 98, category: 'academic' },
      { key: 'tenthMarksPercentage', label: 'Percentage', value: '92.4%', confidence: 95, category: 'academic' },
    ]
  },
  {
    id: 'doc-12th-marksheet',
    name: '12th_CBSE_Marksheet.pdf',
    type: '12th Marksheet',
    fileType: 'pdf',
    sizeBytes: 786432,
    uploadDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'processed',
    confidenceScore: 97,
    extractedFields: [
      { key: 'twelfthRollNo', label: '12th Roll No', value: '26910482', confidence: 99, category: 'academic' },
      { key: 'twelfthPassingYear', label: 'Passing Year', value: '2019', confidence: 98, category: 'academic' },
      { key: 'twelfthMarksPercentage', label: 'Percentage', value: '88.6%', confidence: 96, category: 'academic' },
    ]
  }
];

export const examTemplates: ExamTemplate[] = [
  {
    id: 'upsc-cse-2026',
    title: 'UPSC Civil Services Examination 2026',
    code: 'UPSC-CSE-26',
    organization: 'Union Public Service Commission',
    deadline: '2026-08-30',
    requiredDocuments: ['Aadhaar Card', '10th Marksheet', 'Degree Certificate', 'Domicile Certificate'],
    fields: [
      { id: 'full_name', label: "Applicant's Full Name", type: 'text', profileKey: 'fullName', required: true },
      { id: 'father_name', label: "Father's Name", type: 'text', profileKey: 'fatherName', required: true },
      { id: 'mother_name', label: "Mother's Name", type: 'text', profileKey: 'motherName', required: true },
      { id: 'dob', label: 'Date of Birth (YYYY-MM-DD)', type: 'date', profileKey: 'dob', required: true },
      { id: 'gender', label: 'Gender', type: 'select', profileKey: 'gender', options: ['Male', 'Female', 'Other'], required: true },
      { id: 'category', label: 'Community Category', type: 'select', profileKey: 'category', options: ['General', 'OBC', 'SC', 'ST', 'EWS'], required: true },
      { id: 'email', label: 'Email ID', type: 'email', profileKey: 'email', required: true },
      { id: 'phone', label: 'Mobile Number', type: 'text', profileKey: 'phone', required: true },
      { id: 'aadhaar', label: 'Aadhaar Card Number', type: 'text', profileKey: 'aadhaarNumber', required: true },
      { id: 'address', label: 'Permanent Address', type: 'text', profileKey: 'addressLine1', required: true },
      { id: 'city', label: 'City / District', type: 'text', profileKey: 'city', required: true },
      { id: 'state', label: 'State / UT', type: 'text', profileKey: 'state', required: true },
      { id: 'pincode', label: 'Pincode', type: 'text', profileKey: 'pincode', required: true },
      { id: 'tenth_roll', label: '10th Board Roll Number', type: 'text', profileKey: 'tenthRollNo', required: true },
      { id: 'tenth_pass_year', label: '10th Year of Passing', type: 'text', profileKey: 'tenthPassingYear', required: true },
      { id: 'degree_name', label: 'Graduation Degree Title', type: 'text', profileKey: 'graduationDegree', required: true },
      { id: 'degree_cgpa', label: 'Graduation CGPA / Percentage', type: 'text', profileKey: 'graduationCgpaPercentage', required: true },
    ]
  },
  {
    id: 'ssc-cgl-2026',
    title: 'SSC CGL Combined Graduate Level 2026',
    code: 'SSC-CGL-26',
    organization: 'Staff Selection Commission',
    deadline: '2026-09-15',
    requiredDocuments: ['Aadhaar Card', '10th Marksheet', '12th Marksheet'],
    fields: [
      { id: 'applicant_name', label: 'Candidate Name', type: 'text', profileKey: 'fullName', required: true },
      { id: 'father_name', label: "Father's Name", type: 'text', profileKey: 'fatherName', required: true },
      { id: 'dob', label: 'Date of Birth', type: 'date', profileKey: 'dob', required: true },
      { id: 'gender', label: 'Gender', type: 'select', profileKey: 'gender', options: ['Male', 'Female', 'Other'], required: true },
      { id: 'email', label: 'Email Address', type: 'email', profileKey: 'email', required: true },
      { id: 'phone', label: 'Phone Number', type: 'text', profileKey: 'phone', required: true },
      { id: 'aadhaar_no', label: 'Aadhaar Identification Number', type: 'text', profileKey: 'aadhaarNumber', required: true },
      { id: 'state', label: 'Domicile State', type: 'text', profileKey: 'state', required: true },
      { id: 'tenth_board', label: 'Matriculation Board', type: 'text', profileKey: 'tenthBoard', required: true },
      { id: 'tenth_roll', label: 'Matriculation Roll No', type: 'text', profileKey: 'tenthRollNo', required: true },
      { id: 'twelfth_marks', label: '12th Marks Percentage', type: 'text', profileKey: 'twelfthMarksPercentage', required: true }
    ]
  },
  {
    id: 'gate-2026',
    title: 'GATE 2026 Engineering Portal',
    code: 'GATE-2026',
    organization: 'Indian Institute of Science (IISc)',
    deadline: '2026-10-01',
    requiredDocuments: ['Aadhaar Card', 'Degree Certificate'],
    fields: [
      { id: 'full_name', label: 'Full Legal Name', type: 'text', profileKey: 'fullName', required: true },
      { id: 'email', label: 'Email ID', type: 'email', profileKey: 'email', required: true },
      { id: 'phone', label: 'Mobile Number', type: 'text', profileKey: 'phone', required: true },
      { id: 'category', label: 'Category', type: 'select', profileKey: 'category', options: ['General', 'OBC', 'SC', 'ST', 'EWS'], required: true },
      { id: 'degree', label: 'Qualifying Degree', type: 'text', profileKey: 'graduationDegree', required: true },
      { id: 'college', label: 'College / Institute Name', type: 'text', profileKey: 'graduationUniversity', required: true },
      { id: 'grad_year', label: 'Year of Graduation', type: 'text', profileKey: 'graduationPassingYear', required: true }
    ]
  }
];

export const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return defaultProfile;
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

export const loadDocuments = (): StoredDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load documents', e);
  }
  saveDocuments(sampleDocuments);
  return sampleDocuments;
};

export const saveDocuments = (docs: StoredDocument[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents', e);
  }
};

export const loadAutofillLogs = (): AutofillLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
      examName: 'UPSC Civil Services Examination 2026',
      totalFields: 17,
      filledFields: 17,
      durationMs: 420,
      usedDocuments: ['Aadhaar Card', '10th Marksheet', 'Degree Certificate']
    }
  ];
};

export const saveAutofillLog = (log: AutofillLog): void => {
  try {
    const logs = loadAutofillLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save log', e);
  }
};
