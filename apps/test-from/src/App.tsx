import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Sparkles,
  RotateCcw,
  UserCheck,
  ChevronLeft,
  X
} from 'lucide-react';
import { MobileUpload } from './MobileUpload';
import './govt-portal.css';

interface LogEntry {
  id: string;
  time: string;
  field: string;
  value: string;
  type: 'input' | 'change' | 'autofill';
}

export function App() {
  const isMobileUpload =
    window.location.pathname.includes('/upload') ||
    new URLSearchParams(window.location.search).has('sessionId');

  if (isMobileUpload) {
    return <MobileUpload />;
  }

  // --- Form State ---
  const [formData, setFormData] = useState({
    // General & Declarations
    isProxyCandidate: '',
    nationality: '',
    identificationMark1: '',
    identificationMark2: '',
    religion: '',
    isCustomReligion: false,

    // Benchmark Disability (PwBD)
    isPwBD: '',
    disabilityType: '',
    disabilitySubType: '',
    disabilityCertNumber: '',
    disabilityCertDate: '',
    disabilityIssuingAuthority: '',

    // Safe Negative Declarations (SND)
    isExServiceman: '',
    isCivilianEmployee: '',
    isAgeRelaxation: '',
    isMinorityCommunity: '',
    isScribeNeeded: '',
    isDebarred: '',
    isCriminalCase: '',
    isCourtConvicted: '',
    isDeptEnquiry: '',
    isGovtEmployee: '',
    sharePersonalInfo: '',

    // Exam Centre Preferences
    centrePreference1: '',
    centrePreference2: '',
    centrePreference3: '',
    cbeMedium: '',
    verifyCbeMedium: '',

    // Personal Details (Primary & Verify Pairs)
    candidateName: '',
    verifyCandidateName: '',
    fatherName: '',
    verifyFatherName: '',
    motherName: '',
    verifyMotherName: '',
    dob: '',
    verifyDob: '',
    gender: '',
    verifyGender: '',
    category: '',
    verifyCategory: '',
    maritalStatus: '',
    mobileNumber: '',
    verifyMobileNumber: '',
    emailId: '',
    verifyEmailId: '',
    aadhaarNumber: '',
    verifyAadhaarNumber: '',

    // Correspondence Address
    corrAddress1: '',
    corrAddress2: '',
    corrState: '',
    corrDistrict: '',
    corrPincode: '',

    // Permanent Address
    sameAsPerm: false,
    permAddress1: '',
    permAddress2: '',
    permState: '',
    permDistrict: '',
    permPincode: '',

    // Educational Qualifications
    highestQualification: '',
    qualifyingExam: '',
    tenthBoard: '',
    tenthRollNumber: '',
    tenthPassingYear: '',
    tenthPercentage: '',
    twelfthBoard: '',
    twelfthRollNumber: '',
    twelfthPassingYear: '',
    twelfthPercentage: ''
  });

  // Upload previews
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);
  const [certFileName, setCertFileName] = useState<string | null>(null);

  // Inspector & Log State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Input Change Handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = target.checked;
      setFormData((prev) => {
        const next = { ...prev, [name]: checked };
        if (name === 'sameAsPerm' && checked) {
          next.permAddress1 = prev.corrAddress1;
          next.permAddress2 = prev.corrAddress2;
          next.permState = prev.corrState;
          next.permDistrict = prev.corrDistrict;
          next.permPincode = prev.corrPincode;
        }
        return next;
      });

      addLog(name, checked ? 'checked (true)' : 'unchecked (false)', 'change');
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // If sameAsPerm is active and correspondence address changes, sync to perm
      if (prev.sameAsPerm && name.startsWith('corr')) {
        const permField = name.replace('corr', 'perm') as keyof typeof prev;
        if (permField in next) {
          (next as any)[permField] = value;
        }
      }
      return next;
    });

    addLog(name, value, type === 'change' ? 'change' : 'input');
  };

  const addLog = (field: string, val: string, type: 'input' | 'change' | 'autofill') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      field,
      value: val.length > 30 ? val.substring(0, 27) + '...' : val,
      type
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 29)]);
  };

  // File Upload Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      addLog('uploadPhoto', `${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'change');
    }
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSigPreview(URL.createObjectURL(file));
      addLog('uploadSignature', `${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'change');
    }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFileName(file.name);
      addLog('uploadCertificate', `${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'change');
    }
  };

  // Prefill Sample Candidate Data (for testing)
  const handlePrefillSample = () => {
    setFormData({
      isProxyCandidate: 'No',
      nationality: 'Citizen of India',
      identificationMark1: 'A mole on right cheek',
      identificationMark2: 'No Identification mark',
      religion: 'Hindu',
      isCustomReligion: false,

      isPwBD: 'No',
      disabilityType: '',
      disabilitySubType: '',
      disabilityCertNumber: '',
      disabilityCertDate: '',
      disabilityIssuingAuthority: '',

      isExServiceman: 'No',
      isCivilianEmployee: 'No',
      isAgeRelaxation: 'No',
      isMinorityCommunity: 'No',
      isScribeNeeded: 'No',
      isDebarred: 'No',
      isCriminalCase: 'No',
      isCourtConvicted: 'No',
      isDeptEnquiry: 'No',
      isGovtEmployee: 'No',
      sharePersonalInfo: 'Yes',

      centrePreference1: 'CR - Prayagraj (3003)',
      centrePreference2: 'CR - Lucknow (3010)',
      centrePreference3: 'NR - Delhi (2201)',
      cbeMedium: 'Hindi',
      verifyCbeMedium: 'Hindi',

      candidateName: 'AMAN KUMAR',
      verifyCandidateName: 'AMAN KUMAR',
      fatherName: 'RAMESH KUMAR',
      verifyFatherName: 'RAMESH KUMAR',
      motherName: 'SUNITA DEVI',
      verifyMotherName: 'SUNITA DEVI',
      dob: '2001-08-15',
      verifyDob: '2001-08-15',
      gender: 'Male',
      verifyGender: 'Male',
      category: 'UR (General)',
      verifyCategory: 'UR (General)',
      maritalStatus: 'Unmarried',
      mobileNumber: '9876543210',
      verifyMobileNumber: '9876543210',
      emailId: 'amankumar@gmail.com',
      verifyEmailId: 'amankumar@gmail.com',
      aadhaarNumber: '432187659012',
      verifyAadhaarNumber: '432187659012',

      corrAddress1: 'Flat 402, Shiv Ganga Enclave',
      corrAddress2: 'Sigra, Cantt Road',
      corrState: 'Uttar Pradesh',
      corrDistrict: 'Varanasi',
      corrPincode: '221002',

      sameAsPerm: true,
      permAddress1: 'Flat 402, Shiv Ganga Enclave',
      permAddress2: 'Sigra, Cantt Road',
      permState: 'Uttar Pradesh',
      permDistrict: 'Varanasi',
      permPincode: '221002',

      highestQualification: 'Graduation',
      qualifyingExam: '12th Standard',
      tenthBoard: 'Central Board of Secondary Education (CBSE)',
      tenthRollNumber: '1248902',
      tenthPassingYear: '2019',
      tenthPercentage: '88.4',
      twelfthBoard: 'Central Board of Secondary Education (CBSE)',
      twelfthRollNumber: '6248901',
      twelfthPassingYear: '2021',
      twelfthPercentage: '86.2'
    });
    addLog('System', 'Prefilled all sample candidate details', 'autofill');
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      isProxyCandidate: '',
      nationality: '',
      identificationMark1: '',
      identificationMark2: '',
      religion: '',
      isCustomReligion: false,

      isPwBD: '',
      disabilityType: '',
      disabilitySubType: '',
      disabilityCertNumber: '',
      disabilityCertDate: '',
      disabilityIssuingAuthority: '',

      isExServiceman: '',
      isCivilianEmployee: '',
      isAgeRelaxation: '',
      isMinorityCommunity: '',
      isScribeNeeded: '',
      isDebarred: '',
      isCriminalCase: '',
      isCourtConvicted: '',
      isDeptEnquiry: '',
      isGovtEmployee: '',
      sharePersonalInfo: '',

      centrePreference1: '',
      centrePreference2: '',
      centrePreference3: '',
      cbeMedium: '',
      verifyCbeMedium: '',

      candidateName: '',
      verifyCandidateName: '',
      fatherName: '',
      verifyFatherName: '',
      motherName: '',
      verifyMotherName: '',
      dob: '',
      verifyDob: '',
      gender: '',
      verifyGender: '',
      category: '',
      verifyCategory: '',
      maritalStatus: '',
      mobileNumber: '',
      verifyMobileNumber: '',
      emailId: '',
      verifyEmailId: '',
      aadhaarNumber: '',
      verifyAadhaarNumber: '',

      corrAddress1: '',
      corrAddress2: '',
      corrState: '',
      corrDistrict: '',
      corrPincode: '',

      sameAsPerm: false,
      permAddress1: '',
      permAddress2: '',
      permState: '',
      permDistrict: '',
      permPincode: '',

      highestQualification: '',
      qualifyingExam: '',
      tenthBoard: '',
      tenthRollNumber: '',
      tenthPassingYear: '',
      tenthPercentage: '',
      twelfthBoard: '',
      twelfthRollNumber: '',
      twelfthPassingYear: '',
      twelfthPercentage: ''
    });
    setPhotoPreview(null);
    setSigPreview(null);
    setCertFileName(null);
    setSubmittedData(null);
    addLog('System', 'Reset all fields', 'change');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData(formData);
    addLog('System', 'Form submitted successfully!', 'change');
    setIsDrawerOpen(true);
  };

  // Calculate filled fields count
  const fieldKeys = Object.keys(formData) as (keyof typeof formData)[];
  const filledCount = fieldKeys.filter((k) => {
    const val = formData[k];
    return val !== '' && val !== false && val !== null;
  }).length;
  const fillPercentage = Math.round((filledCount / fieldKeys.length) * 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP HEADER BANNER (SSC / GOVT OF INDIA EXACT BRANDING) */}
      <header className="gov-top-header">
        <div className="gov-header-inner">
          <div className="gov-branding">
            <div className="gov-emblem-badge">
              <svg viewBox="0 0 100 100" width="40" height="40">
                <circle cx="50" cy="50" r="46" fill="#1e3a8a" />
                <circle cx="50" cy="50" r="38" fill="#ffffff" />
                <circle cx="50" cy="50" r="22" fill="#1e3a8a" />
                <path d="M50 15 L54 35 L75 35 L58 48 L64 70 L50 56 L36 70 L42 48 L25 35 L46 35 Z" fill="#f59e0b" />
              </svg>
            </div>
            <div className="gov-title-group">
              <h1>STAFF SELECTION COMMISSION</h1>
              <h2>कर्मचारी चयन आयोग</h2>
              <p>GOVERNMENT OF INDIA / भारत सरकार</p>
            </div>
          </div>

          <div className="gov-user-widget">
            <div className="gov-user-info">
              <span className="gov-user-name">Welcome, AMAN KUMAR</span>
              <span className="gov-user-reg">Reg No: 100029384</span>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                A
              </div>
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#dc2626',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  fontWeight: 700
                }}
              >
                1
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. PROGRESS STEPPER (EXACT REPRODUCTION OF 7 STEPS) */}
      <nav className="gov-stepper-container">
        <div className="gov-stepper-inner">
          <div className="gov-step-connector" />

          {/* Step 1 */}
          <div className="gov-step-item completed">
            <div className="gov-step-circle">✓</div>
            <span className="gov-step-label">Candidate Registration</span>
          </div>

          {/* Step 2 */}
          <div className="gov-step-item completed">
            <div className="gov-step-circle">✓</div>
            <span className="gov-step-label">Qualification Details</span>
          </div>

          {/* Step 3 */}
          <div className="gov-step-item completed">
            <div className="gov-step-circle">✓</div>
            <span className="gov-step-label">Additional Info</span>
          </div>

          {/* Step 4: Active */}
          <div className="gov-step-item active">
            <div className="gov-step-circle">4</div>
            <span className="gov-step-label">Other Details</span>
          </div>

          {/* Step 5 */}
          <div className="gov-step-item">
            <div className="gov-step-circle">5</div>
            <span className="gov-step-label">Upload Documents</span>
          </div>

          {/* Step 6 */}
          <div className="gov-step-item">
            <div className="gov-step-circle">6</div>
            <span className="gov-step-label">Preview Application</span>
          </div>

          {/* Step 7 */}
          <div className="gov-step-item">
            <div className="gov-step-circle">7</div>
            <span className="gov-step-label">Fee Payment</span>
          </div>
        </div>
      </nav>

      {/* Action Strip above Card */}
      <div className="gov-top-actions-strip">
        <button type="button" className="gov-btn-back" onClick={() => alert('Navigating to Step 3')}>
          <ChevronLeft size={16} /> Back
        </button>
        <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
          Check before proceeding to next page
        </span>
        <span className="gov-mandatory-note">* Indicates Mandatory Field</span>
      </div>

      {/* 3. MAIN FORM CONTAINER */}
      <main className="gov-portal-main">
        <div className="gov-form-card">
          <div className="gov-card-title">
            <span>Other Details</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>
              Combined Graduate Level / CHSL Examination 2026
            </span>
          </div>

          <form onSubmit={handleSubmit} id="govExamForm">
            {/* --- SECTION 1: PROXY & NATIONALITY --- */}
            <div className="gov-section">
              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="isProxyCandidate">
                    Are you Appearing on behalf of any Other Candidate (Proxy Candidate)? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group" id="isProxyCandidate">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isProxyCandidate"
                        value="Yes"
                        checked={formData.isProxyCandidate === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isProxyCandidate"
                        value="No"
                        checked={formData.isProxyCandidate === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="nationality">
                    Nationality / Citizenship <span className="gov-req">*</span>
                  </label>
                  <select
                    id="nationality"
                    name="nationality"
                    className="gov-select"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Nationality / Citizenship...</option>
                    <option value="Citizen of India">Citizen of India</option>
                    <option value="Subject of Nepal">A subject of Nepal</option>
                    <option value="Subject of Bhutan">A subject of Bhutan</option>
                    <option value="Tibetan Refugee">A Tibetan refugee came to India before 1st Jan 1962</option>
                    <option value="Person of Indian Origin">Person of Indian origin migrated from Pakistan, Burma, etc.</option>
                  </select>
                </div>
              </div>

              {/* Visible Identification Marks */}
              <div style={{ marginTop: '12px' }}>
                <span className="gov-label" style={{ marginBottom: '6px' }}>
                  Visible Identification Marks <span className="gov-req">*</span>
                </span>
                <p className="gov-sub-label">
                  Candidate must enter at least one visible identification mark (e.g. mole on face, scar on forehead)
                </p>

                <div className="gov-grid-2" style={{ marginTop: '8px' }}>
                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="identificationMark1">
                      Identification Mark 1 <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="identificationMark1"
                      name="identificationMark1"
                      className="gov-input"
                      placeholder="e.g. A mole on right cheek"
                      value={formData.identificationMark1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="identificationMark2">
                      Identification Mark 2
                    </label>
                    <input
                      type="text"
                      id="identificationMark2"
                      name="identificationMark2"
                      className="gov-input"
                      placeholder="e.g. Scar on left forehead"
                      value={formData.identificationMark2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="gov-alert-box">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Note:</strong> The candidate having no identification mark on body may write
                    <em> 'No Identification mark'</em> in first identification mark and leave the second identification mark blank.
                  </div>
                </div>
              </div>

              {/* Religion */}
              <div style={{ marginTop: '14px' }}>
                <label className="gov-label" htmlFor="religionGroup">
                  Religion <span className="gov-req">*</span>
                </label>
                <div className="gov-radio-group" id="religionGroup" style={{ marginTop: '4px' }}>
                  {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Others'].map((rel) => (
                    <label key={rel} className="gov-radio-label">
                      <input
                        type="radio"
                        name="religion"
                        value={rel}
                        checked={formData.religion === rel}
                        onChange={handleInputChange}
                      />
                      {rel}
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '6px' }}>
                  <label className="gov-radio-label" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    <input
                      type="checkbox"
                      name="isCustomReligion"
                      checked={formData.isCustomReligion}
                      onChange={handleInputChange}
                    />
                    Is Religion not specified in above list? (Tick if yes to specify)
                  </label>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: BENCHMARK DISABILITY (PwBD) DETAILS --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">PwBD Details (Persons with Benchmark Disability)</h3>

              <div className="gov-form-group">
                <label className="gov-label" htmlFor="isPwBDGroup">
                  Are you a Person with Benchmark Disability (PwBD)? <span className="gov-req">*</span>
                </label>
                <div className="gov-radio-group" id="isPwBDGroup">
                  <label className="gov-radio-label">
                    <input
                      type="radio"
                      name="isPwBD"
                      value="Yes"
                      checked={formData.isPwBD === 'Yes'}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                  <label className="gov-radio-label">
                    <input
                      type="radio"
                      name="isPwBD"
                      value="No"
                      checked={formData.isPwBD === 'No'}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="gov-grid-2" style={{ marginTop: '10px' }}>
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="disabilityType">Type of Disability</label>
                  <select
                    id="disabilityType"
                    name="disabilityType"
                    className="gov-select"
                    value={formData.disabilityType}
                    onChange={handleInputChange}
                    disabled={formData.isPwBD !== 'Yes'}
                  >
                    <option value="">Select Disability...</option>
                    <option value="VH">Blindness and low vision (VH)</option>
                    <option value="HH">Deaf and hard of hearing (HH)</option>
                    <option value="OH">Locomotor disability (OH)</option>
                    <option value="Autism">Autism, intellectual disability, specific learning disability</option>
                    <option value="Multiple">Multiple disabilities</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="disabilitySubType">Sub Type of Disability</label>
                  <select
                    id="disabilitySubType"
                    name="disabilitySubType"
                    className="gov-select"
                    value={formData.disabilitySubType}
                    onChange={handleInputChange}
                    disabled={formData.isPwBD !== 'Yes'}
                  >
                    <option value="">Select Sub Type...</option>
                    <option value="LowVision">Low Vision</option>
                    <option value="Blindness">Blindness</option>
                    <option value="HardOfHearing">Hard of Hearing</option>
                    <option value="OneArm">One Arm Affected (OA)</option>
                    <option value="OneLeg">One Leg Affected (OL)</option>
                  </select>
                </div>
              </div>

              <div className="gov-grid-3" style={{ marginTop: '10px' }}>
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="disabilityCertNumber">Disability Certificate Number</label>
                  <input
                    type="text"
                    id="disabilityCertNumber"
                    name="disabilityCertNumber"
                    className="gov-input"
                    placeholder="Cert No. e.g. PWD/2023/892"
                    value={formData.disabilityCertNumber}
                    onChange={handleInputChange}
                    disabled={formData.isPwBD !== 'Yes'}
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="disabilityCertDate">Certificate Issue Date</label>
                  <input
                    type="date"
                    id="disabilityCertDate"
                    name="disabilityCertDate"
                    className="gov-input"
                    value={formData.disabilityCertDate}
                    onChange={handleInputChange}
                    disabled={formData.isPwBD !== 'Yes'}
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="disabilityIssuingAuthority">Issuing Authority / CMO</label>
                  <input
                    type="text"
                    id="disabilityIssuingAuthority"
                    name="disabilityIssuingAuthority"
                    className="gov-input"
                    placeholder="Hospital / Civil Surgeon"
                    value={formData.disabilityIssuingAuthority}
                    onChange={handleInputChange}
                    disabled={formData.isPwBD !== 'Yes'}
                  />
                </div>
              </div>

              <div className="gov-alert-box">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Note:</strong> PwBD candidates are required to submit original Disability Certificate
                  issued by competent medical authority at the time of Document Verification.
                </div>
              </div>
            </div>

            {/* --- SECTION 3: SAFE NEGATIVE DECLARATIONS (SND) --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">Special Categories & Negative Declarations</h3>

              <div className="gov-grid-2">
                {/* ESM */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Are you an Ex-Serviceman (ESM)? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isExServiceman"
                        value="Yes"
                        checked={formData.isExServiceman === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isExServiceman"
                        value="No"
                        checked={formData.isExServiceman === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Central Govt Civilian */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Are you a Central Govt Civilian Employee? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isCivilianEmployee"
                        value="Yes"
                        checked={formData.isCivilianEmployee === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isCivilianEmployee"
                        value="No"
                        checked={formData.isCivilianEmployee === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Age Relaxation */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Whether seeking Age Relaxation? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isAgeRelaxation"
                        value="Yes"
                        checked={formData.isAgeRelaxation === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isAgeRelaxation"
                        value="No"
                        checked={formData.isAgeRelaxation === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Minority Community */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Do you belong to Minority Community? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isMinorityCommunity"
                        value="Yes"
                        checked={formData.isMinorityCommunity === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isMinorityCommunity"
                        value="No"
                        checked={formData.isMinorityCommunity === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Scribe Limitation */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Do you have physical limitation to write (Scribe needed)? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isScribeNeeded"
                        value="Yes"
                        checked={formData.isScribeNeeded === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isScribeNeeded"
                        value="No"
                        checked={formData.isScribeNeeded === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Debarred */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Have you ever been debarred by any PSC / SSC / UPSC? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isDebarred"
                        value="Yes"
                        checked={formData.isDebarred === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isDebarred"
                        value="No"
                        checked={formData.isDebarred === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* FIR / Criminal Case */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Whether any FIR / Criminal case has ever been registered against you? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isCriminalCase"
                        value="Yes"
                        checked={formData.isCriminalCase === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isCriminalCase"
                        value="No"
                        checked={formData.isCriminalCase === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Court Convicted */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Whether you were ever arrested / detained / convicted by court of law? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isCourtConvicted"
                        value="Yes"
                        checked={formData.isCourtConvicted === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isCourtConvicted"
                        value="No"
                        checked={formData.isCourtConvicted === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Departmental Enquiry */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Whether any departmental enquiry / disciplinary action is pending against you? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isDeptEnquiry"
                        value="Yes"
                        checked={formData.isDeptEnquiry === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="isDeptEnquiry"
                        value="No"
                        checked={formData.isDeptEnquiry === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* DoP&T Info Sharing */}
                <div className="gov-form-group">
                  <label className="gov-label">
                    Do you want to make your personal info available for job opportunities? <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="sharePersonalInfo"
                        value="Yes"
                        checked={formData.sharePersonalInfo === 'Yes'}
                        onChange={handleInputChange}
                      />
                      Yes
                    </label>
                    <label className="gov-radio-label">
                      <input
                        type="radio"
                        name="sharePersonalInfo"
                        value="No"
                        checked={formData.sharePersonalInfo === 'No'}
                        onChange={handleInputChange}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 4: EXAM CENTRE PREFERENCES & MEDIUM --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">Preference of Examination Centres & CBE Medium</h3>

              <div className="gov-grid-3">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="centrePreference1">
                    Centre Preference 1 <span className="gov-req">*</span>
                  </label>
                  <select
                    id="centrePreference1"
                    name="centrePreference1"
                    className="gov-select"
                    value={formData.centrePreference1}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Preference 1...</option>
                    <option value="CR - Prayagraj (3003)">CR - Prayagraj (Allahabad) (3003)</option>
                    <option value="CR - Lucknow (3010)">CR - Lucknow (3010)</option>
                    <option value="CR - Varanasi (3013)">CR - Varanasi (3013)</option>
                    <option value="NR - Delhi (2201)">NR - Delhi / NCR (2201)</option>
                    <option value="NR - Jaipur (2401)">NR - Jaipur (2401)</option>
                    <option value="WR - Mumbai (7204)">WR - Mumbai (7204)</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="centrePreference2">
                    Centre Preference 2 <span className="gov-req">*</span>
                  </label>
                  <select
                    id="centrePreference2"
                    name="centrePreference2"
                    className="gov-select"
                    value={formData.centrePreference2}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Preference 2...</option>
                    <option value="CR - Lucknow (3010)">CR - Lucknow (3010)</option>
                    <option value="CR - Kanpur (3009)">CR - Kanpur (3009)</option>
                    <option value="CR - Agra (3001)">CR - Agra (3001)</option>
                    <option value="NR - Meerut (2203)">NR - Meerut (2203)</option>
                    <option value="NR - Dehradun (2002)">NR - Dehradun (2002)</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="centrePreference3">
                    Centre Preference 3 <span className="gov-req">*</span>
                  </label>
                  <select
                    id="centrePreference3"
                    name="centrePreference3"
                    className="gov-select"
                    value={formData.centrePreference3}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Preference 3...</option>
                    <option value="NR - Delhi (2201)">NR - Delhi / NCR (2201)</option>
                    <option value="CR - Gorakhpur (3006)">CR - Gorakhpur (3006)</option>
                    <option value="CR - Bareilly (3005)">CR - Bareilly (3005)</option>
                    <option value="NR - Rohtak (2205)">NR - Rohtak (2205)</option>
                  </select>
                </div>
              </div>

              <div className="gov-grid-2" style={{ marginTop: '12px' }}>
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="cbeMedium">
                    Medium of Computer Based Examination (CBE) <span className="gov-req">*</span>
                  </label>
                  <select
                    id="cbeMedium"
                    name="cbeMedium"
                    className="gov-select"
                    value={formData.cbeMedium}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select CBE Medium...</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Odia">Odia</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyCbeMedium">
                    Verify Medium of Computer Based Examination <span className="gov-req">*</span>
                  </label>
                  <select
                    id="verifyCbeMedium"
                    name="verifyCbeMedium"
                    className="gov-select"
                    value={formData.verifyCbeMedium}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Verify CBE Medium...</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Odia">Odia</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* --- SECTION 5: PERSONAL DETAILS (PRIMARY & VERIFICATION PAIRS) --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">Personal Details</h3>

              <div className="gov-alert-box">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Important:</strong> Candidate Name, Father's Name, Mother's Name and Date of Birth
                  must exactly match as given in Matriculation (10th) Certificate. Do not use prefix like Shri/Smt/Dr.
                </div>
              </div>

              {/* Name & Verify Name */}
              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="candidateName">
                    Candidate Name <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="candidateName"
                    name="candidateName"
                    className="gov-input"
                    placeholder="As in Matriculation Certificate"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyCandidateName">
                    Verify Candidate Name <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="verifyCandidateName"
                    name="verifyCandidateName"
                    className="gov-input"
                    placeholder="Re-enter Candidate Name"
                    value={formData.verifyCandidateName}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </div>

              {/* Father Name & Verify */}
              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="fatherName">
                    Father's Name <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    className="gov-input"
                    placeholder="Father's Full Name"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyFatherName">
                    Verify Father's Name <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="verifyFatherName"
                    name="verifyFatherName"
                    className="gov-input"
                    placeholder="Re-enter Father's Name"
                    value={formData.verifyFatherName}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </div>

              {/* Mother Name & Verify */}
              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="motherName">
                    Mother's Name <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="motherName"
                    name="motherName"
                    className="gov-input"
                    placeholder="Mother's Full Name"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyMotherName">
                    Verify Mother's Name <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="verifyMotherName"
                    name="verifyMotherName"
                    className="gov-input"
                    placeholder="Re-enter Mother's Name"
                    value={formData.verifyMotherName}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </div>

              {/* DOB & Verify DOB */}
              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="dob">
                    Date of Birth (DD/MM/YYYY) <span className="gov-req">*</span>
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    className="gov-input"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyDob">
                    Verify Date of Birth (DD/MM/YYYY) <span className="gov-req">*</span>
                  </label>
                  <input
                    type="date"
                    id="verifyDob"
                    name="verifyDob"
                    className="gov-input"
                    value={formData.verifyDob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Gender & Category Radios */}
              <div className="gov-grid-2" style={{ marginTop: '10px' }}>
                <div className="gov-form-group">
                  <label className="gov-label">
                    Gender <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    {['Male', 'Female', 'Transgender'].map((g) => (
                      <label key={g} className="gov-radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={formData.gender === g}
                          onChange={handleInputChange}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">
                    Verify Gender <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    {['Male', 'Female', 'Transgender'].map((g) => (
                      <label key={g} className="gov-radio-label">
                        <input
                          type="radio"
                          name="verifyGender"
                          value={g}
                          checked={formData.verifyGender === g}
                          onChange={handleInputChange}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Category */}
              <div className="gov-grid-2" style={{ marginTop: '10px' }}>
                <div className="gov-form-group">
                  <label className="gov-label">
                    Category <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    {['UR (General)', 'EWS', 'OBC', 'SC', 'ST'].map((c) => (
                      <label key={c} className="gov-radio-label">
                        <input
                          type="radio"
                          name="category"
                          value={c}
                          checked={formData.category === c}
                          onChange={handleInputChange}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">
                    Verify Category <span className="gov-req">*</span>
                  </label>
                  <div className="gov-radio-group">
                    {['UR (General)', 'EWS', 'OBC', 'SC', 'ST'].map((c) => (
                      <label key={c} className="gov-radio-label">
                        <input
                          type="radio"
                          name="verifyCategory"
                          value={c}
                          checked={formData.verifyCategory === c}
                          onChange={handleInputChange}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Marital Status & Aadhaar */}
              <div className="gov-grid-3" style={{ marginTop: '12px' }}>
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="maritalStatus">
                    Marital Status <span className="gov-req">*</span>
                  </label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    className="gov-select"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Marital Status...</option>
                    <option value="Unmarried">Unmarried</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Judicially Separated">Judicially Separated</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="aadhaarNumber">
                    Aadhaar Number <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    className="gov-input"
                    placeholder="12 Digit Aadhaar Number"
                    maxLength={12}
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyAadhaarNumber">
                    Verify Aadhaar Number <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="verifyAadhaarNumber"
                    name="verifyAadhaarNumber"
                    className="gov-input"
                    placeholder="Re-enter 12 Digit Aadhaar"
                    maxLength={12}
                    value={formData.verifyAadhaarNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Mobile & Email */}
              <div className="gov-grid-2" style={{ marginTop: '10px' }}>
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="mobileNumber">
                    Mobile Number <span className="gov-req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    className="gov-input"
                    placeholder="10 Digit Mobile Number"
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyMobileNumber">
                    Verify Mobile Number <span className="gov-req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="verifyMobileNumber"
                    name="verifyMobileNumber"
                    className="gov-input"
                    placeholder="Re-enter Mobile Number"
                    maxLength={10}
                    value={formData.verifyMobileNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="emailId">
                    Email ID <span className="gov-req">*</span>
                  </label>
                  <input
                    type="email"
                    id="emailId"
                    name="emailId"
                    className="gov-input"
                    placeholder="e.g. name@domain.com"
                    value={formData.emailId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="verifyEmailId">
                    Verify Email ID <span className="gov-req">*</span>
                  </label>
                  <input
                    type="email"
                    id="verifyEmailId"
                    name="verifyEmailId"
                    className="gov-input"
                    placeholder="Re-enter Email ID"
                    value={formData.verifyEmailId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 6: ADDRESS DETAILS (WITH SAME AS PERMANENT AUTO-TRIGGER) --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">Address for Correspondence</h3>

              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="corrAddress1">
                    Address Line 1 <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="corrAddress1"
                    name="corrAddress1"
                    className="gov-input"
                    placeholder="Flat/House No., Building, Street"
                    value={formData.corrAddress1}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="corrAddress2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="corrAddress2"
                    name="corrAddress2"
                    className="gov-input"
                    placeholder="Area, Colony, Sector, Landmark"
                    value={formData.corrAddress2}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="gov-grid-3" style={{ marginTop: '8px' }}>
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="corrState">
                    State / UT <span className="gov-req">*</span>
                  </label>
                  <select
                    id="corrState"
                    name="corrState"
                    className="gov-select"
                    value={formData.corrState}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select State / UT...</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="corrDistrict">
                    District <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="corrDistrict"
                    name="corrDistrict"
                    className="gov-input"
                    placeholder="District Name"
                    value={formData.corrDistrict}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="corrPincode">
                    PIN Code <span className="gov-req">*</span>
                  </label>
                  <input
                    type="text"
                    id="corrPincode"
                    name="corrPincode"
                    className="gov-input"
                    placeholder="6 Digit PIN Code"
                    maxLength={6}
                    value={formData.corrPincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Permanent Address with Same-as Checkbox */}
              <div style={{ marginTop: '20px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a' }}>Permanent Address</h4>
                  <label className="gov-radio-label" style={{ fontWeight: 600, color: '#1e40af' }}>
                    <input
                      type="checkbox"
                      id="sameAsPerm"
                      name="sameAsPerm"
                      checked={formData.sameAsPerm}
                      onChange={handleInputChange}
                    />
                    Is Permanent Address same as Present / Correspondence Address?
                  </label>
                </div>

                <div className="gov-grid-2">
                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="permAddress1">
                      Permanent Address Line 1 <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="permAddress1"
                      name="permAddress1"
                      className="gov-input"
                      placeholder="Flat/House No., Building, Street"
                      value={formData.permAddress1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="permAddress2">
                      Permanent Address Line 2
                    </label>
                    <input
                      type="text"
                      id="permAddress2"
                      name="permAddress2"
                      className="gov-input"
                      placeholder="Area, Colony, Sector, Landmark"
                      value={formData.permAddress2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="gov-grid-3" style={{ marginTop: '8px' }}>
                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="permState">
                      State / UT <span className="gov-req">*</span>
                    </label>
                    <select
                      id="permState"
                      name="permState"
                      className="gov-select"
                      value={formData.permState}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select State / UT...</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="permDistrict">
                      District <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="permDistrict"
                      name="permDistrict"
                      className="gov-input"
                      placeholder="District Name"
                      value={formData.permDistrict}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="permPincode">
                      PIN Code <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="permPincode"
                      name="permPincode"
                      className="gov-input"
                      placeholder="6 Digit PIN Code"
                      maxLength={6}
                      value={formData.permPincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 7: EDUCATIONAL QUALIFICATIONS (FOR MANDATORY SCANNER TEST) --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">Educational Qualification Details</h3>

              <div className="gov-grid-2">
                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="highestQualification">
                    Highest Educational Qualification <span className="gov-req">*</span>
                  </label>
                  <select
                    id="highestQualification"
                    name="highestQualification"
                    className="gov-select"
                    value={formData.highestQualification}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Highest Qualification...</option>
                    <option value="Graduation">Graduation / Degree (B.Sc / B.A / B.Com / B.Tech)</option>
                    <option value="Post Graduation">Post Graduation / Master's Degree</option>
                    <option value="12th Standard">10+2 / Intermediate / Higher Secondary</option>
                    <option value="10th Standard">10th Standard / Matriculation</option>
                    <option value="Diploma">Diploma (3 Years Polytechnic)</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label" htmlFor="qualifyingExam">
                    Details of Qualifying Educational Qualification <span className="gov-req">*</span>
                  </label>
                  <select
                    id="qualifyingExam"
                    name="qualifyingExam"
                    className="gov-select"
                    value={formData.qualifyingExam}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Qualifying Exam...</option>
                    <option value="12th Standard">12th Standard</option>
                    <option value="Equivalent">Equivalent to 12th Standard</option>
                    <option value="Degree">Bachelor's Degree</option>
                  </select>
                </div>
              </div>

              {/* 10th Standard Row */}
              <div style={{ marginTop: '14px' }}>
                <span className="gov-label" style={{ fontWeight: 700, color: '#1e3a8a' }}>
                  Matriculation / 10th Standard Details
                </span>
                <div className="gov-grid-4" style={{ marginTop: '6px' }}>
                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="tenthBoard">Board / Council <span className="gov-req">*</span></label>
                    <input
                      type="text"
                      id="tenthBoard"
                      name="tenthBoard"
                      className="gov-input"
                      placeholder="e.g. CBSE / UP Board"
                      value={formData.tenthBoard}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="tenthRollNumber">Roll Number <span className="gov-req">*</span></label>
                    <input
                      type="text"
                      id="tenthRollNumber"
                      name="tenthRollNumber"
                      className="gov-input"
                      placeholder="10th Roll No"
                      value={formData.tenthRollNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="tenthPassingYear">Passing Year <span className="gov-req">*</span></label>
                    <select
                      id="tenthPassingYear"
                      name="tenthPassingYear"
                      className="gov-select"
                      value={formData.tenthPassingYear}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Passing Year...</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                    </select>
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="tenthPercentage">Percentage / CGPA <span className="gov-req">*</span></label>
                    <input
                      type="text"
                      id="tenthPercentage"
                      name="tenthPercentage"
                      className="gov-input"
                      placeholder="e.g. 84.5%"
                      value={formData.tenthPercentage}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 12th Standard Row (Mandatory - Triggers Missing Mandatory Amber Outline if empty!) */}
              <div style={{ marginTop: '16px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="gov-label" style={{ fontWeight: 700, color: '#92400e' }}>
                    Higher Secondary / 12th Standard Details (Mandatory Field Test)
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                    ⚡ Tests SmartFill Missing-Mandatory Yellow Outline
                  </span>
                </div>

                <div className="gov-grid-4" style={{ marginTop: '8px' }}>
                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="twelfthBoard">
                      12th Board / Council <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="twelfthBoard"
                      name="twelfthBoard"
                      className="gov-input"
                      placeholder="e.g. CBSE / State Board"
                      value={formData.twelfthBoard}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="twelfthRollNumber">
                      12th Roll Number <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="twelfthRollNumber"
                      name="twelfthRollNumber"
                      className="gov-input"
                      placeholder="12th Roll Number"
                      value={formData.twelfthRollNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="twelfthPassingYear">
                      12th Year of Passing <span className="gov-req">*</span>
                    </label>
                    <select
                      id="twelfthPassingYear"
                      name="twelfthPassingYear"
                      className="gov-select"
                      value={formData.twelfthPassingYear}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Year...</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                    </select>
                  </div>

                  <div className="gov-form-group">
                    <label className="gov-label" htmlFor="twelfthPercentage">
                      12th Percentage / CGPA <span className="gov-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="twelfthPercentage"
                      name="twelfthPercentage"
                      className="gov-input"
                      placeholder="e.g. 82.6%"
                      value={formData.twelfthPercentage}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 8: UPLOAD DOCUMENTS (FOR EXTENSION FILE UPLOAD TEST) --- */}
            <div className="gov-section">
              <h3 className="gov-section-title">Upload Documents</h3>

              <div className="gov-grid-3">
                {/* Photo Upload */}
                <div className="gov-upload-card">
                  <span className="gov-label">
                    Upload Recent Photograph <span className="gov-req">*</span>
                  </span>
                  <span className="gov-sub-label">20 KB to 50 KB (JPEG / JPG), 3.5cm x 4.5cm</span>
                  <input
                    type="file"
                    id="uploadPhoto"
                    name="uploadPhoto"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handlePhotoUpload}
                    className="gov-input"
                    style={{ fontSize: '0.75rem' }}
                  />

                  <div className="gov-upload-preview">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Uploaded Photo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', padding: '6px' }}>
                        Photo Preview (3.5 x 4.5 cm)
                      </span>
                    )}
                  </div>
                </div>

                {/* Signature Upload */}
                <div className="gov-upload-card">
                  <span className="gov-label">
                    Upload Candidate Signature <span className="gov-req">*</span>
                  </span>
                  <span className="gov-sub-label">10 KB to 20 KB (JPEG / JPG), 4.0cm x 2.0cm</span>
                  <input
                    type="file"
                    id="uploadSignature"
                    name="uploadSignature"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleSigUpload}
                    className="gov-input"
                    style={{ fontSize: '0.75rem' }}
                  />

                  <div className="gov-upload-preview sig">
                    {sigPreview ? (
                      <img src={sigPreview} alt="Signature Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', padding: '6px' }}>
                        Signature Preview (4 x 2 cm)
                      </span>
                    )}
                  </div>
                </div>

                {/* 10th Certificate Upload */}
                <div className="gov-upload-card">
                  <span className="gov-label">Upload 10th Certificate</span>
                  <span className="gov-sub-label">PDF or JPG format, Maximum size: 200 KB</span>
                  <input
                    type="file"
                    id="uploadCertificate"
                    name="uploadCertificate"
                    accept=".pdf,image/jpeg,image/jpg,image/png"
                    onChange={handleCertUpload}
                    className="gov-input"
                    style={{ fontSize: '0.75rem' }}
                  />

                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: certFileName ? '#15803d' : '#94a3b8' }}>
                    {certFileName ? `✓ ${certFileName} attached` : 'No document attached'}
                  </div>
                </div>
              </div>
            </div>

            {/* --- FOOTER ACTIONS --- */}
            <div className="gov-footer-actions">
              <button type="button" className="gov-btn-secondary" onClick={() => alert('Navigating to previous step...')}>
                <ChevronLeft size={16} /> Previous Step
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="gov-btn-draft" onClick={() => alert('Draft saved successfully to local storage!')}>
                  Save as Draft
                </button>
                <button type="submit" className="gov-btn-primary">
                  <CheckCircle2 size={16} /> Save & Next / Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Portal Footer Stamp */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Server ID: SSC-PROD-DELHI-04 | NIC Application Portal Engine v4.8.2 | Best viewed in 1920x1080 resolution
        </div>
      </main>

      {/* 4. SMARTFILL FLOATING TEST MONITOR TOGGLE */}
      <button
        type="button"
        className="smartfill-floating-toggle"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Sparkles size={16} color="#38bdf8" />
        <span>SmartFill Inspector</span>
        <span
          style={{
            background: 'rgba(56, 189, 248, 0.2)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem'
          }}
        >
          {filledCount}/{fieldKeys.length} ({fillPercentage}%)
        </span>
      </button>

      {/* 5. SMARTFILL SLIDE-OVER DRAWER (DEV MONITOR & TESTING UTILITIES) */}
      <div className={`smartfill-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="smartfill-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              SmartFill Dev & Live Monitor
            </h3>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="smartfill-drawer-body">
          {/* Quick Testing Tools */}
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Quick Action Buttons
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrefillSample}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={14} /> Prefill Sample Candidate
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} /> Clear All Fields
              </button>
            </div>
          </div>

          {/* Fill Status Progress */}
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Total Form Fields Filled</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {filledCount} / {fieldKeys.length} ({fillPercentage}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${fillPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Missing Mandatory Fields Checklist */}
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertCircle size={15} /> Missing Mandatory Checklist
            </span>
            <p style={{ fontSize: '0.72rem', color: '#d1d5db', marginBottom: '8px' }}>
              The following required fields trigger the yellow glowing outline if left blank:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {!formData.identificationMark1 && (
                <li style={{ color: '#fcd34d' }}>• Identification Mark 1 (Required)</li>
              )}
              {!formData.candidateName && (
                <li style={{ color: '#fcd34d' }}>• Candidate Name (Required)</li>
              )}
              {!formData.dob && (
                <li style={{ color: '#fcd34d' }}>• Date of Birth (Required)</li>
              )}
              {!formData.aadhaarNumber && (
                <li style={{ color: '#fcd34d' }}>• Aadhaar Number (Required)</li>
              )}
              {!formData.corrAddress1 && (
                <li style={{ color: '#fcd34d' }}>• Correspondence Address Line 1 (Required)</li>
              )}
              {!formData.twelfthBoard && (
                <li style={{ color: '#fcd34d' }}>• 12th Board / Council (Required)</li>
              )}
              {!formData.twelfthRollNumber && (
                <li style={{ color: '#fcd34d' }}>• 12th Roll Number (Required)</li>
              )}
              {!formData.twelfthPassingYear && (
                <li style={{ color: '#fcd34d' }}>• 12th Passing Year (Required)</li>
              )}
              {!formData.twelfthPercentage && (
                <li style={{ color: '#fcd34d' }}>• 12th Percentage / CGPA (Required)</li>
              )}
              {formData.identificationMark1 &&
                formData.candidateName &&
                formData.dob &&
                formData.aadhaarNumber &&
                formData.corrAddress1 &&
                formData.twelfthBoard &&
                formData.twelfthRollNumber &&
                formData.twelfthPassingYear &&
                formData.twelfthPercentage && (
                  <li style={{ color: '#10b981', fontWeight: 600 }}>
                    ✓ All key mandatory fields are filled!
                  </li>
                )}
            </ul>
          </div>

          {/* Live DOM Event Monitor */}
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={15} color="#38bdf8" /> DOM Event Monitor
              </span>
              <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '1px 6px', borderRadius: '10px' }}>
                Live Stream
              </span>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: '180px',
                maxHeight: '260px',
                overflowY: 'auto',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                  No field events captured yet.<br />Autofill with SmartFill to inspect events!
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${
                        log.type === 'autofill'
                          ? '#10b981'
                          : log.type === 'change'
                          ? '#38bdf8'
                          : '#6366f1'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{log.field}</span>
                      <span style={{ fontSize: '0.65rem' }}>{log.time}</span>
                    </div>
                    <div style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>
                      val: "{log.value}"
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submitted Data Viewer */}
          {submittedData && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Submitted JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(submittedData, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.68rem',
                  color: '#a7f3d0',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px',
                  borderRadius: '6px'
                }}
              >
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
