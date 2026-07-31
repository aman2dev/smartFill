export interface PopularExam {
  id: string;
  title: string;
  shortCode: string;
  organization: string;
  portalUrl: string;
  domain: string;
  status: 'Pre-Mapped & Ready' | 'Active';
  badgeColor: string;
  description: string;
  mappedFields: string[];
}

export const POPULAR_EXAMS: PopularExam[] = [
  {
    id: 'bpsc-tre-4',
    title: 'BPSC TRE 4.0 (Bihar Teacher Recruitment)',
    shortCode: 'BPSC TRE 4.0',
    organization: 'Bihar Public Service Commission',
    portalUrl: 'https://onlinebpsc.bihar.gov.in',
    domain: 'bpsc.bihar.gov.in',
    status: 'Pre-Mapped & Ready',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Teacher Recruitment Examination 4.0 for Primary, Middle, Secondary & Senior Secondary Teachers.',
    mappedFields: ['FullName', 'FatherName', 'MotherName', 'DOB', 'Gender', 'Category', 'AadhaarNumber', 'CTET_RollNo', 'Graduation_Marks']
  },
  {
    id: 'ctet-2026',
    title: 'CTET (Central Teacher Eligibility Test)',
    shortCode: 'CTET 2026',
    organization: 'CBSE / Ministry of Education',
    portalUrl: 'https://ctet.nic.in',
    domain: 'ctet.nic.in',
    status: 'Pre-Mapped & Ready',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'National Teacher Eligibility Test for Class I to VIII teaching eligibility.',
    mappedFields: ['CandidateName', 'FatherName', 'MotherName', 'DOB', 'Category', 'AadhaarNo', 'BEd_Marks', 'Address']
  },
  {
    id: 'ssc-cgl-2026',
    title: 'SSC CGL / CHSL 2026',
    shortCode: 'SSC CGL',
    organization: 'Staff Selection Commission',
    portalUrl: 'https://ssc.gov.in',
    domain: 'ssc.gov.in',
    status: 'Pre-Mapped & Ready',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Combined Graduate Level Recruitment Examination for Group B & C posts.',
    mappedFields: ['Name', 'FatherName', 'MotherName', 'DOB', 'Category', 'TenthRollNo', 'GraduationDegree']
  },
  {
    id: 'upsc-otr',
    title: 'UPSC One Time Registration (OTR)',
    shortCode: 'UPSC OTR',
    organization: 'Union Public Service Commission',
    portalUrl: 'https://upsconline.nic.in',
    domain: 'upsconline.nic.in',
    status: 'Pre-Mapped & Ready',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'One Time Registration portal for UPSC Civil Services, NDA, CDS & Exam Applications.',
    mappedFields: ['ApplicantName', 'FatherName', 'MotherName', 'DOB', 'Gender', 'Category', 'Email', 'Phone']
  }
];
