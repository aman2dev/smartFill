import type { DocumentType, ExtractedField, FileType, UserProfile } from '../types';

export interface AIAnalysisResult {
  documentType: DocumentType;
  confidenceScore: number;
  extractedFields: ExtractedField[];
  profileUpdates: Partial<UserProfile>;
}

// Simulates smart AI OCR and LLM Context Extraction from document files
export const processDocumentWithAI = async (
  file: File,
  suggestedType?: DocumentType
): Promise<AIAnalysisResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const fileName = file.name.toLowerCase();
  const fileExt = (file.name.split('.').pop()?.toLowerCase() || 'png') as FileType;

  let docType: DocumentType = suggestedType || 'Other Document';

  if (!suggestedType) {
    if (fileName.includes('aadhaar') || fileName.includes('uidai') || fileName.includes('aadhar')) {
      docType = 'Aadhaar Card';
    } else if (fileName.includes('10th') || fileName.includes('ssc') || fileName.includes('matric')) {
      docType = '10th Marksheet';
    } else if (fileName.includes('12th') || fileName.includes('hsc') || fileName.includes('inter')) {
      docType = '12th Marksheet';
    } else if (fileName.includes('degree') || fileName.includes('btech') || fileName.includes('bsc')) {
      docType = 'Degree Certificate';
    } else if (fileName.includes('domicile') || fileName.includes('residence')) {
      docType = 'Domicile Certificate';
    } else if (fileName.includes('pan')) {
      docType = 'PAN Card';
    } else if (fileName.includes('photo') || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png') {
      docType = 'Passport Photo';
    }
  }

  switch (docType) {
    case 'Aadhaar Card':
      return {
        documentType: 'Aadhaar Card',
        confidenceScore: 98,
        extractedFields: [
          { key: 'fullName', label: 'Full Name', value: 'Rahul Sharma', confidence: 99, category: 'personal' },
          { key: 'fatherName', label: "Father's Name", value: 'Mahesh Sharma', confidence: 97, category: 'personal' },
          { key: 'dob', label: 'Date of Birth', value: '2001-08-15', confidence: 99, category: 'personal' },
          { key: 'gender', label: 'Gender', value: 'Male', confidence: 98, category: 'personal' },
          { key: 'aadhaarNumber', label: 'Aadhaar Number', value: '5489 1204 9832', confidence: 99, category: 'identity' },
          { key: 'addressLine1', label: 'Address', value: 'Flat 402, Green Valley Apartments, MG Road', confidence: 94, category: 'contact' },
          { key: 'city', label: 'City', value: 'New Delhi', confidence: 96, category: 'contact' },
          { key: 'state', label: 'State', value: 'Delhi', confidence: 98, category: 'contact' },
          { key: 'pincode', label: 'Pincode', value: '110001', confidence: 99, category: 'contact' },
        ],
        profileUpdates: {
          fullName: 'Rahul Sharma',
          fatherName: 'Mahesh Sharma',
          dob: '2001-08-15',
          gender: 'Male',
          aadhaarNumber: '5489 1204 9832',
          addressLine1: 'Flat 402, Green Valley Apartments, MG Road',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          email: 'rahul.sharma2001@example.com',
          phone: '+91 98765 43210'
        }
      };

    case '10th Marksheet':
      return {
        documentType: '10th Marksheet',
        confidenceScore: 96,
        extractedFields: [
          { key: 'fullName', label: 'Student Name', value: 'Rahul Sharma', confidence: 99, category: 'personal' },
          { key: 'tenthBoard', label: 'Education Board', value: 'CBSE (Central Board of Secondary Education)', confidence: 97, category: 'academic' },
          { key: 'tenthRollNo', label: '10th Roll Number', value: '12849031', confidence: 99, category: 'academic' },
          { key: 'tenthPassingYear', label: 'Year of Passing', value: '2017', confidence: 98, category: 'academic' },
          { key: 'tenthMarksPercentage', label: 'Percentage / CGPA', value: '92.4%', confidence: 95, category: 'academic' },
        ],
        profileUpdates: {
          tenthBoard: 'CBSE',
          tenthRollNo: '12849031',
          tenthPassingYear: '2017',
          tenthMarksPercentage: '92.4%'
        }
      };

    case '12th Marksheet':
      return {
        documentType: '12th Marksheet',
        confidenceScore: 97,
        extractedFields: [
          { key: 'fullName', label: 'Student Name', value: 'Rahul Sharma', confidence: 99, category: 'personal' },
          { key: 'twelfthBoard', label: 'Education Board', value: 'CBSE', confidence: 98, category: 'academic' },
          { key: 'twelfthRollNo', label: '12th Roll Number', value: '26910482', confidence: 99, category: 'academic' },
          { key: 'twelfthPassingYear', label: 'Year of Passing', value: '2019', confidence: 98, category: 'academic' },
          { key: 'twelfthMarksPercentage', label: 'Percentage', value: '88.6%', confidence: 96, category: 'academic' },
        ],
        profileUpdates: {
          twelfthBoard: 'CBSE',
          twelfthRollNo: '26910482',
          twelfthPassingYear: '2019',
          twelfthMarksPercentage: '88.6%'
        }
      };

    case 'Degree Certificate':
      return {
        documentType: 'Degree Certificate',
        confidenceScore: 95,
        extractedFields: [
          { key: 'graduationDegree', label: 'Degree Name', value: 'B.Tech in Computer Science & Engineering', confidence: 96, category: 'academic' },
          { key: 'graduationUniversity', label: 'University / Institute', value: 'Delhi Technological University (DTU)', confidence: 95, category: 'academic' },
          { key: 'graduationPassingYear', label: 'Passing Year', value: '2023', confidence: 98, category: 'academic' },
          { key: 'graduationCgpaPercentage', label: 'CGPA', value: '8.75 / 10', confidence: 94, category: 'academic' },
        ],
        profileUpdates: {
          graduationDegree: 'B.Tech Computer Science',
          graduationUniversity: 'Delhi Technological University',
          graduationPassingYear: '2023',
          graduationCgpaPercentage: '8.75'
        }
      };

    case 'PAN Card':
      return {
        documentType: 'PAN Card',
        confidenceScore: 99,
        extractedFields: [
          { key: 'panNumber', label: 'PAN Number', value: 'ABCPS8492K', confidence: 99, category: 'identity' },
          { key: 'fullName', label: 'Name on Card', value: 'Rahul Sharma', confidence: 99, category: 'personal' },
          { key: 'fatherName', label: "Father's Name", value: 'Mahesh Sharma', confidence: 97, category: 'personal' },
          { key: 'dob', label: 'Date of Birth', value: '2001-08-15', confidence: 99, category: 'personal' },
        ],
        profileUpdates: {
          panNumber: 'ABCPS8492K'
        }
      };

    default:
      return {
        documentType: docType,
        confidenceScore: 91,
        extractedFields: [
          { key: 'documentTitle', label: 'Document Name', value: file.name, confidence: 90, category: 'personal' },
          { key: 'uploadDate', label: 'Scan Date', value: new Date().toLocaleDateString(), confidence: 100, category: 'personal' },
        ],
        profileUpdates: {}
      };
  }
};
