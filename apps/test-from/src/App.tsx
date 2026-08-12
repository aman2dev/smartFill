import React, { useState } from 'react';
import { 
  FileText, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Terminal,
  Upload,
  AlertCircle,
  Copy,
  Layers
} from 'lucide-react';
import { MobileUpload } from './MobileUpload';

type FormTab = 'govt' | 'job' | 'kyc';

interface LogEntry {
  id: string;
  time: string;
  field: string;
  value: string;
  type: 'input' | 'change' | 'autofill';
}

export function App() {
  const isMobileUpload = window.location.pathname.includes('/upload') || new URLSearchParams(window.location.search).has('sessionId');

  if (isMobileUpload) {
    return <MobileUpload />;
  }

  const [activeTab, setActiveTab] = useState<FormTab>('govt');
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Govt Exam Fields
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    category: 'General',
    aadhaar: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    examCenter1: 'New Delhi',
    examCenter2: 'Mumbai',
    
    // Job App Fields
    email: '',
    phone: '',
    qualification: 'B.Tech / B.E.',
    experience: '3',
    currentCtc: '',
    expectedCtc: '',
    linkedin: '',
    portfolio: '',
    noticePeriod: '15 Days',
    coverLetter: '',

    // KYC Fields
    panCard: '',
    accountNumber: '',
    ifscCode: '',
    incomeRange: '5L-10L',
    maritalStatus: 'Single',
    emergencyContact: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      field: name,
      value: value.length > 25 ? value.substring(0, 22) + '...' : value,
      type: type === 'change' ? 'change' : 'input'
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      fatherName: '',
      motherName: '',
      dob: '',
      gender: 'Male',
      category: 'General',
      aadhaar: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      examCenter1: 'New Delhi',
      examCenter2: 'Mumbai',
      email: '',
      phone: '',
      qualification: 'B.Tech / B.E.',
      experience: '3',
      currentCtc: '',
      expectedCtc: '',
      linkedin: '',
      portfolio: '',
      noticePeriod: '15 Days',
      coverLetter: '',
      panCard: '',
      accountNumber: '',
      ifscCode: '',
      incomeRange: '5L-10L',
      maritalStatus: 'Single',
      emergencyContact: ''
    });
    setSubmittedData(null);
  };

  const fillMockData = () => {
    setFormData(prev => ({
      ...prev,
      fullName: 'Rahul Sharma',
      fatherName: 'Sanjay Sharma',
      motherName: 'Sunita Sharma',
      dob: '1998-05-15',
      gender: 'Male',
      category: 'OBC',
      aadhaar: '1234 5678 9012',
      address: '123, Ring Road, Lajpat Nagar',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      qualification: 'B.Tech / B.E.',
      experience: '4',
      currentCtc: '12 LPA',
      expectedCtc: '16 LPA',
      linkedin: 'https://linkedin.com/in/rahulsharma',
      portfolio: 'https://rahulsharma.dev',
      coverLetter: 'Passionate full-stack developer with 4 years of experience.',
      panCard: 'ABCDE1234F',
      accountNumber: '98765432101234',
      ifscCode: 'SBIN0001234',
      emergencyContact: 'Sanjay Sharma - 9811122233'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData(formData);
  };

  // Calculate field stats
  const currentTabFields = {
    govt: ['fullName', 'fatherName', 'motherName', 'dob', 'gender', 'category', 'aadhaar', 'address', 'city', 'state', 'pincode'],
    job: ['fullName', 'email', 'phone', 'qualification', 'experience', 'currentCtc', 'expectedCtc', 'linkedin', 'portfolio', 'coverLetter'],
    kyc: ['fullName', 'panCard', 'aadhaar', 'accountNumber', 'ifscCode', 'incomeRange', 'maritalStatus', 'emergencyContact']
  };

  const activeFields = currentTabFields[activeTab];
  const filledCount = activeFields.filter(f => Boolean((formData as any)[f])).length;
  const fillPercentage = Math.round((filledCount / activeFields.length) * 100);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Header Banner */}
      <header className="glass-panel" style={{ padding: '20px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SmartFill Extension Test Studio
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Standardized web forms designed for testing Chrome extension autofill capabilities & field detection.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={fillMockData}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', 
              border: '1px solid rgba(99, 102, 241, 0.3)', padding: '8px 16px', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 500
            }}>
            <Sparkles size={16} /> Fill Demo Data
          </button>
          <button 
            onClick={handleReset}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', 
              border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 500
            }}>
            <RotateCcw size={16} /> Reset Form
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        
        {/* Main Form Area */}
        <main>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('govt')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontWeight: 600,
                borderColor: activeTab === 'govt' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                background: activeTab === 'govt' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(20, 27, 45, 0.6)',
                color: activeTab === 'govt' ? '#fff' : '#9ca3af',
                transition: 'all 0.2s ease'
              }}>
              <FileText size={18} /> Govt Exam Application
            </button>
            <button
              onClick={() => setActiveTab('job')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontWeight: 600,
                borderColor: activeTab === 'job' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                background: activeTab === 'job' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(20, 27, 45, 0.6)',
                color: activeTab === 'job' ? '#fff' : '#9ca3af',
                transition: 'all 0.2s ease'
              }}>
              <Briefcase size={18} /> Job Application Form
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontWeight: 600,
                borderColor: activeTab === 'kyc' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                background: activeTab === 'kyc' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(20, 27, 45, 0.6)',
                color: activeTab === 'kyc' ? '#fff' : '#9ca3af',
                transition: 'all 0.2s ease'
              }}>
              <Building2 size={18} /> Banking & KYC Verification
            </button>
          </div>

          {/* Form Container */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} id="smartfill-test-form">
              
              {/* TAB 1: GOVT EXAM FORM */}
              {activeTab === 'govt' && (
                <div className="animate-fade-in">
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', marginBottom: '4px' }}>
                      Government Job / Exam Registration Form
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                      Contains standard applicant personal details, category, address, and exam preferences.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        <span>Full Candidate Name *</span>
                        <span className="field-badge">id="fullName"</span>
                      </label>
                      <input 
                        type="text" id="fullName" name="fullName" className="form-input" 
                        placeholder="e.g. Rahul Sharma" value={formData.fullName} onChange={handleInputChange} required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fatherName" className="form-label">
                        <span>Father's Name *</span>
                        <span className="field-badge">id="fatherName"</span>
                      </label>
                      <input 
                        type="text" id="fatherName" name="fatherName" className="form-input" 
                        placeholder="e.g. Sanjay Sharma" value={formData.fatherName} onChange={handleInputChange} required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="motherName" className="form-label">
                        <span>Mother's Name *</span>
                        <span className="field-badge">id="motherName"</span>
                      </label>
                      <input 
                        type="text" id="motherName" name="motherName" className="form-input" 
                        placeholder="e.g. Sunita Sharma" value={formData.motherName} onChange={handleInputChange} required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dob" className="form-label">
                        <span>Date of Birth *</span>
                        <span className="field-badge">id="dob"</span>
                      </label>
                      <input 
                        type="date" id="dob" name="dob" className="form-input" 
                        value={formData.dob} onChange={handleInputChange} required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender" className="form-label">
                        <span>Gender *</span>
                        <span className="field-badge">name="gender"</span>
                      </label>
                      <select id="gender" name="gender" className="form-select" value={formData.gender} onChange={handleInputChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="category" className="form-label">
                        <span>Category / Community *</span>
                        <span className="field-badge">name="category"</span>
                      </label>
                      <select id="category" name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                        <option value="General">General / UR</option>
                        <option value="OBC">OBC (Non-Creamy Layer)</option>
                        <option value="SC">Scheduled Caste (SC)</option>
                        <option value="ST">Scheduled Tribe (ST)</option>
                        <option value="EWS">Economically Weaker Section (EWS)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="aadhaar" className="form-label">
                      <span>Aadhaar Card / ID Number *</span>
                      <span className="field-badge">id="aadhaar"</span>
                    </label>
                    <input 
                      type="text" id="aadhaar" name="aadhaar" className="form-input" 
                      placeholder="12 Digit Aadhaar Number" value={formData.aadhaar} onChange={handleInputChange} required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      <span>Permanent Address *</span>
                      <span className="field-badge">id="address"</span>
                    </label>
                    <textarea 
                      id="address" name="address" rows={2} className="form-textarea" 
                      placeholder="House No, Street, Landmark" value={formData.address} onChange={handleInputChange} required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">City *</label>
                      <input type="text" id="city" name="city" className="form-input" placeholder="City" value={formData.city} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state" className="form-label">State *</label>
                      <input type="text" id="state" name="state" className="form-input" placeholder="State" value={formData.state} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pincode" className="form-label">PIN Code *</label>
                      <input type="text" id="pincode" name="pincode" className="form-input" placeholder="Pin code" value={formData.pincode} onChange={handleInputChange} required />
                    </div>
                  </div>

                  {/* Document Upload Simulation */}
                  <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(15,23,42,0.4)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 600, marginBottom: '12px' }}>
                      <Upload size={18} /> Document File Upload Fields
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="form-label" style={{ marginBottom: '6px' }}>Candidate Photo (.jpg/.png)</label>
                        <input type="file" id="photoUpload" name="photoUpload" accept="image/*" className="form-input" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label className="form-label" style={{ marginBottom: '6px' }}>Signature Scan (.jpg/.png)</label>
                        <input type="file" id="signatureUpload" name="signatureUpload" accept="image/*" className="form-input" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: JOB APPLICATION FORM */}
              {activeTab === 'job' && (
                <div className="animate-fade-in">
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', marginBottom: '4px' }}>
                      Software Engineer Application Form
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                      Tests email, phone, experience, portfolio links, and long-text cover letter.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">Candidate Name *</label>
                      <input type="text" id="fullName" name="fullName" className="form-input" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        <span>Email Address *</span>
                        <span className="field-badge">type="email"</span>
                      </label>
                      <input type="email" id="email" name="email" className="form-input" placeholder="name@domain.com" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        <span>Mobile Phone *</span>
                        <span className="field-badge">type="tel"</span>
                      </label>
                      <input type="tel" id="phone" name="phone" className="form-input" placeholder="+91 9876543210" value={formData.phone} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="qualification" className="form-label">Highest Degree</label>
                      <select id="qualification" name="qualification" className="form-select" value={formData.qualification} onChange={handleInputChange}>
                        <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                        <option value="M.Tech">M.Tech / M.E.</option>
                        <option value="BCA / MCA">BCA / MCA</option>
                        <option value="B.Sc / M.Sc">B.Sc / M.Sc</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="experience" className="form-label">Years of Experience</label>
                      <input type="number" id="experience" name="experience" className="form-input" min="0" max="30" value={formData.experience} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="currentCtc" className="form-label">Current Salary (LPA)</label>
                      <input type="text" id="currentCtc" name="currentCtc" className="form-input" placeholder="e.g. 12 LPA" value={formData.currentCtc} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="linkedin" className="form-label">LinkedIn Profile URL</label>
                      <input type="url" id="linkedin" name="linkedin" className="form-input" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                      <label htmlFor="portfolio" className="form-label">Portfolio / GitHub URL</label>
                      <input type="url" id="portfolio" name="portfolio" className="form-input" placeholder="https://github.com/..." value={formData.portfolio} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="coverLetter" className="form-label">Cover Letter / Bio</label>
                    <textarea id="coverLetter" name="coverLetter" rows={3} className="form-textarea" placeholder="Brief intro about yourself..." value={formData.coverLetter} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* TAB 3: BANKING & KYC */}
              {activeTab === 'kyc' && (
                <div className="animate-fade-in">
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', marginBottom: '4px' }}>
                      Banking & Account KYC Verification
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                      Tests PAN card number, bank account details, IFSC code, and emergency contact details.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="panCard" className="form-label">
                        <span>PAN Card Number *</span>
                        <span className="field-badge">id="panCard"</span>
                      </label>
                      <input type="text" id="panCard" name="panCard" className="form-input" placeholder="ABCDE1234F" value={formData.panCard} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="accountNumber" className="form-label">
                        <span>Bank Account Number *</span>
                        <span className="field-badge">id="accountNumber"</span>
                      </label>
                      <input type="text" id="accountNumber" name="accountNumber" className="form-input" placeholder="10-16 Digit Number" value={formData.accountNumber} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ifscCode" className="form-label">
                        <span>IFSC Code *</span>
                        <span className="field-badge">id="ifscCode"</span>
                      </label>
                      <input type="text" id="ifscCode" name="ifscCode" className="form-input" placeholder="SBIN0001234" value={formData.ifscCode} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="incomeRange" className="form-label">Annual Income Bracket</label>
                      <select id="incomeRange" name="incomeRange" className="form-select" value={formData.incomeRange} onChange={handleInputChange}>
                        <option value="Below 2.5L">Below 2.5 Lakhs</option>
                        <option value="2.5L-5L">2.5L - 5 Lakhs</option>
                        <option value="5L-10L">5L - 10 Lakhs</option>
                        <option value="Above 10L">Above 10 Lakhs</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergencyContact" className="form-label">Emergency Contact Details</label>
                    <input type="text" id="emergencyContact" name="emergencyContact" className="form-input" placeholder="Name & Phone Number" value={formData.emergencyContact} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff', border: 'none', padding: '12px 28px',
                    borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                  }}>
                  <CheckCircle2 size={18} /> Submit Test Form
                </button>
              </div>
            </form>

            {/* Submitted Payload Viewer */}
            {submittedData && (
              <div className="animate-fade-in" style={{ marginTop: '24px', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} /> Form Submitted Successfully!
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(submittedData, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                    <Copy size={14} /> {copied ? 'Copied JSON!' : 'Copy JSON'}
                  </button>
                </div>
                <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#a7f3d0', overflowX: 'auto', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar: Form Inspector & Extension Live Event Debugger */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Fill Status Meter */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#6366f1" /> Extension Field Detector
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
                <span>Fields Filled</span>
                <span style={{ fontWeight: 600, color: '#6366f1' }}>{filledCount} / {activeFields.length} ({fillPercentage}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${fillPercentage}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #06b6d4)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> SmartFill content script will target inputs by id, name, or placeholder matching.
            </div>
          </div>

          {/* Real-time Event Monitor Log */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#06b6d4" /> DOM Event Monitor
              </h3>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                Live
              </span>
            </div>

            <div style={{ 
              flex: 1, 
              minHeight: '260px',
              maxHeight: '400px', 
              overflowY: 'auto', 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {logs.length === 0 ? (
                <div style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                  No field events captured yet.<br/>Type in fields or use extension to autofill!
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{ padding: '6px 8px', borderRadius: '4px', background: 'rgba(15,23,42,0.6)', borderLeft: `3px solid ${log.type === 'change' ? '#06b6d4' : '#6366f1'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>{log.field}</span>
                      <span style={{ fontSize: '0.7rem' }}>{log.time}</span>
                    </div>
                    <div style={{ color: '#e5e7eb', marginTop: '2px', wordBreak: 'break-all' }}>
                      val: "{log.value}"
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

export default App;
