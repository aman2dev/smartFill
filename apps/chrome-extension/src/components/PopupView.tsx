import React, { useState, useEffect } from 'react';
import {
  Upload,
  Zap,
  Sparkles,
  RefreshCw,
  FileText,
  Trash2,
  LogIn,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Maximize2,
  FilePlus,
  AlertCircle
} from 'lucide-react';
import type { StoredDocument } from '../types';
import {
  getTempCustomerDocsAsync,
  saveTempCustomerDocs,
  getTempExtractedFieldsAsync,
  saveTempExtractedFields,
  clearTempCustomerSession,
  isCustomerSessionPaid,
  setCustomerSessionPaid
} from '../services/storage';
import { UserSession } from '../services/authService';
import { ExamLauncher } from './ExamLauncher';
import { PopularExam } from '../services/popularExams';

interface PopupViewProps {
  session: UserSession | null;
  onOpenAuth: () => void;
  onUpdateSession: (session: UserSession) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PopupView: React.FC<PopupViewProps> = ({
  session,
  onOpenAuth,
  onUpdateSession,
  onNotify,
}) => {
  const [tempDocs, setTempDocs] = useState<StoredDocument[]>([]);
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [sessionPaid, setSessionPaid] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<PopularExam | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPopupView, setIsPopupView] = useState(false);

  useEffect(() => {
    getTempCustomerDocsAsync().then((docs) => setTempDocs(docs));
    getTempExtractedFieldsAsync().then((fields) => setExtractedFields(fields));
    setSessionPaid(isCustomerSessionPaid());

    const isPopup = window.location.pathname.endsWith('popup.html') ||
      document.getElementById('root')?.getAttribute('data-view') === 'popup';
    setIsPopupView(isPopup);
  }, []);

  const handleOpenFullTab = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/options.html', '_blank');
    }
  };

  const processFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const newDocs: StoredDocument[] = Array.from(files).map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      type: file.name.toLowerCase().includes('aadhaar') ? 'Aadhaar Card' : 'Degree Certificate',
      fileType: file.name.endsWith('.pdf') ? 'pdf' : 'jpg',
      sizeBytes: file.size,
      uploadDate: new Date().toISOString(),
      status: 'processed',
      confidenceScore: 98,
      extractedFields: [],
    }));

    const updated = [...tempDocs, ...newDocs];
    setTempDocs(updated);
    saveTempCustomerDocs(updated);
    onNotify('success', 'Documents Added', `Added ${newDocs.length} customer document(s) to active session.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleAddFilesButtonClick = (e: React.MouseEvent) => {
    if (isPopupView) {
      e.preventDefault();
      onNotify('info', 'Opening Dedicated Tab', 'Opening full uploader tab so file selection does not close window...');
      setTimeout(() => {
        handleOpenFullTab();
      }, 500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveDoc = (id: string) => {
    const updated = tempDocs.filter((d) => d.id !== id);
    setTempDocs(updated);
    saveTempCustomerDocs(updated);
  };

  const handleExtractData = () => {
    if (tempDocs.length === 0) {
      onNotify('error', 'No Documents Uploaded', 'Please upload at least 1 customer document first.');
      return;
    }

    setIsExtracting(true);
    setTimeout(() => {
      const simulatedData: Record<string, string> = {
        fullName: 'Amit Kumar Verma',
        fatherName: 'Rajesh Verma',
        motherName: 'Sunita Devi',
        dob: '1998-05-12',
        gender: 'Male',
        category: 'OBC',
        aadhaarNumber: '7849 2019 4832',
        email: 'amit.verma98@gmail.com',
        phone: '+91 98123 45678',
        tenthBoard: 'BSEB Patna (Bihar Board)',
        tenthRollNo: '2409182',
        tenthPassingYear: '2014',
        tenthMarksPercentage: '84.2%',
        twelfthBoard: 'BSEB Patna',
        twelfthRollNo: '1094821',
        twelfthPassingYear: '2016',
        twelfthMarksPercentage: '81.5%',
        graduationDegree: 'B.Ed / B.Sc Physics',
        graduationUniversity: 'Patna University',
        graduationPassingYear: '2020',
        graduationCgpaPercentage: '78.9%',
      };

      setExtractedFields(simulatedData);
      saveTempExtractedFields(simulatedData);
      setIsExtracting(false);
      onNotify('success', 'AI Extraction Complete', 'Extracted 12 customer fields from uploaded documents.');
    }, 1200);
  };

  const handleStartNewCustomer = () => {
    clearTempCustomerSession();
    setTempDocs([]);
    setExtractedFields({});
    setSessionPaid(false);
    setSelectedExam(null);
    onNotify('info', 'Session Cleared', 'Ready for new customer form filling.');
  };

  const handleAutofill = async () => {
    if (!session) {
      onNotify('error', 'Authentication Required', 'Please sign in to auto fill forms.');
      onOpenAuth();
      return;
    }

    if (Object.keys(extractedFields).length === 0) {
      onNotify('error', 'No Customer Data', 'Please extract document data before autofilling.');
      return;
    }

    setIsAutofilling(true);

    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'AUTOFILL_FORM',
              payload: extractedFields,
            });
          }
        });
      }

      if (!sessionPaid) {
        if (session.user.credits <= 0) {
          onNotify('error', 'Insufficient Credits', 'Please recharge your AI credits to fill forms.');
          setIsAutofilling(false);
          return;
        }

        const newCredits = Math.max(0, session.user.credits - 1);
        const updatedSession: UserSession = {
          ...session,
          user: {
            ...session.user,
            credits: newCredits,
          },
        };
        onUpdateSession(updatedSession);
        setSessionPaid(true);
        setCustomerSessionPaid(true);
        onNotify('success', 'Form Autofilled! (1 Credit Used)', `Remaining AI Credits: ${newCredits}`);
      } else {
        onNotify('success', 'Form Autofilled!', 'Customer session active (0 additional credits charged).');
      }
    } catch (err: any) {
      onNotify('error', 'Autofill Failed', err.message || 'Failed to fill form on webpage.');
    } finally {
      setIsAutofilling(false);
    }
  };

  if (!session) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md">
          <Zap className="w-8 h-8 fill-white" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            smartFill Extension
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            AI Exam Form Autofill Engine for Cyber Cafe Operators. Sign in to access customer session management & 1-click BPSC TRE 4.0 form filling.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs text-slate-700">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cyber Cafe Operator Benefits:</span>
          </div>
          <p className="pl-6 text-slate-600">✓ 50 Free AI Credits on Register</p>
          <p className="pl-6 text-slate-600">✓ Pre-mapped BPSC TRE 4.0 & CTET shortcuts</p>
          <p className="pl-6 text-slate-600">✓ 1 Credit per Customer Application Session</p>
        </div>

        <button
          onClick={onOpenAuth}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Operator Sign In / Register</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const extractedKeysCount = Object.keys(extractedFields).length;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-5 shadow-xl space-y-5">
      
      {/* Top Session Action Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Active Customer Session
            </h2>
            <p className="text-[11px] text-slate-500">
              {tempDocs.length} Docs Uploaded • {extractedKeysCount} Fields Extracted
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenFullTab}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs border border-orange-200 transition-colors cursor-pointer"
            title="Open in dedicated tab (prevents popup auto-closing when selecting files)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Tab Uploader</span>
          </button>

          <button
            onClick={handleStartNewCustomer}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
            title="Clear active customer data and start fresh for next customer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Start New Customer</span>
          </button>
        </div>
      </div>

      {/* POPULAR EXAM LAUNCHER (BPSC TRE 4.0, CTET, SSC) */}
      <ExamLauncher onSelectExam={(exam) => setSelectedExam(exam)} />

      {/* STEP 1: UPLOAD CUSTOMER DOCUMENTS */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 rounded-2xl p-4 space-y-3 transition-all ${
          isDragOver
            ? 'border-orange-500 bg-orange-50/50'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">
              1
            </span>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Upload Customer Documents (Aadhaar / Marksheets)
            </h3>
          </div>

          <label
            onClick={handleAddFilesButtonClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Files</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {isPopupView && (
          <div className="flex items-center space-x-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Pro Tip for Popups:</strong> Drag & drop PDF files directly into this box, or click <strong>Full Tab Uploader</strong> above so Chrome doesn't close the window!
            </span>
          </div>
        )}

        {tempDocs.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 bg-white rounded-xl p-6 text-center text-slate-500 text-xs space-y-2">
            <FilePlus className="w-8 h-8 text-orange-400 mx-auto" />
            <p className="font-semibold text-slate-700">
              Drag & Drop customer PDF / Image files here
            </p>
            <p className="text-[11px] text-slate-400">
              Supports Aadhaar Card, 10th/12th/Graduation Marksheets & Certificates
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tempDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 2: EXTRACT CUSTOMER DATA */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">
              2
            </span>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Data Extraction
            </h3>
          </div>

          <button
            onClick={handleExtractData}
            disabled={isExtracting || tempDocs.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isExtracting ? 'Extracting Data...' : 'Extract Customer Data'}</span>
          </button>
        </div>

        {extractedKeysCount > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-bold border-b border-slate-100 pb-1.5">
              <span>Extracted Fields Summary</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                {extractedKeysCount} Fields Ready
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Name:</span>
                <span className="font-semibold text-slate-800">{extractedFields.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Father Name:</span>
                <span className="font-semibold text-slate-800">{extractedFields.fatherName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">DOB:</span>
                <span className="font-semibold text-slate-800">{extractedFields.dob}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Aadhaar:</span>
                <span className="font-semibold text-slate-800">{extractedFields.aadhaarNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">10th Roll No:</span>
                <span className="font-semibold text-slate-800">{extractedFields.tenthRollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Qualification:</span>
                <span className="font-semibold text-slate-800">{extractedFields.graduationDegree}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: AUTOFILL FORM */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">
              3
            </span>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {selectedExam ? `Auto Fill ${selectedExam.shortCode}` : 'Auto Fill Active Form Page'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-600">
            {sessionPaid
              ? '✓ Session Paid (0 Additional Credits for multi-step pages)'
              : 'Costs 1 AI Credit per customer application session'}
          </p>
        </div>

        <button
          onClick={handleAutofill}
          disabled={isAutofilling || extractedKeysCount === 0}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{isAutofilling ? 'Autofilling Form...' : 'Auto Fill Form Now'}</span>
        </button>
      </div>

    </div>
  );
};
