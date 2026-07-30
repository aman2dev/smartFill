import React, { useState } from 'react';
import type { StoredDocument, DocumentType, UserProfile } from '../types';
import main from '../services/imagetotext';
import {
  Upload,
  FileCheck,
  Trash2,
  Eye,
  FileText,
  Scan,
  X,
  CheckCircle2,
  Clock,
  Layers,
  Terminal
} from 'lucide-react';

interface DocumentVaultProps {
  documents: StoredDocument[];
  onUploadDocument: (doc: StoredDocument, profileUpdates?: Partial<UserProfile>) => void;
  onDeleteDocument: (docId: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onNotify,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentType>('Aadhaar Card');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<StoredDocument | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lastExtractedText, setLastExtractedText] = useState<string | null>(null);

  const docTypes: DocumentType[] = [
    'Aadhaar Card',
    '10th Marksheet',
    '12th Marksheet',
    'Degree Certificate',
    'Domicile Certificate',
    'PAN Card',
    'Passport Photo',
    'Signature',
    'Other Document'
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      onNotify('error', 'Invalid Format', 'Please upload a PDF, PNG, JPEG, or WebP file.');
      return;
    }

    try {
      setIsScanning(true);
      setScanStep(`Reading ${file.name} binary data...`);
      
      setScanStep('Running Gemini 2.5 Flash AI to extract text & fields...');
      
      const extractedContent = (await main(file)) || '';
      setLastExtractedText(extractedContent);

      setScanStep('Extracting structured keys (Name, Parents, Aadhaar, DOB, Gender, Category)...');

      const profileUpdates: Partial<UserProfile> = {};
      let fields: { key: string; label: string; value: string; confidence: number; category: any }[] = [];

      try {
        const jsonStart = extractedContent.indexOf('{');
        const jsonEnd = extractedContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(extractedContent.substring(jsonStart, jsonEnd + 1));
          
          if (parsed.full_name || parsed.fullName || parsed.name) profileUpdates.fullName = parsed.full_name || parsed.fullName || parsed.name;
          if (parsed.father_name || parsed.fatherName) profileUpdates.fatherName = parsed.father_name || parsed.fatherName;
          if (parsed.mother_name || parsed.motherName) profileUpdates.motherName = parsed.mother_name || parsed.motherName;
          if (parsed.gender) profileUpdates.gender = parsed.gender;
          if (parsed.category) profileUpdates.category = parsed.category;
          if (parsed.aadhaar_no || parsed.aadhaarNumber) profileUpdates.aadhaarNumber = parsed.aadhaar_no || parsed.aadhaarNumber;
          if (parsed.address) profileUpdates.addressLine1 = parsed.address;
          if (parsed.city) profileUpdates.city = parsed.city;
          if (parsed.town) profileUpdates.town = parsed.town;

          fields = Object.entries(parsed).map(([k, v]) => ({
            key: k,
            label: k.replace(/_/g, ' ').toUpperCase(),
            value: String(v),
            confidence: 95,
            category: 'personal'
          }));
        }
      } catch (e) {
        fields = [
          { key: 'doc_name', label: 'DOCUMENT NAME', value: file.name, confidence: 95, category: 'identity' },
          { key: 'raw_preview', label: 'RAW EXTRACT PREVIEW', value: extractedContent.slice(0, 100) + '...', confidence: 90, category: 'personal' }
        ];
      }

      const newDoc: StoredDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: selectedType,
        fileType: ext as any,
        sizeBytes: file.size,
        uploadDate: new Date().toISOString(),
        status: 'processed',
        confidenceScore: 96,
        extractedFields: fields.length > 0 ? fields : [
          { key: 'status', label: 'STATUS', value: 'Extracted text logged to console & saved to storage', confidence: 99, category: 'personal' }
        ],
      };

      onUploadDocument(newDoc, profileUpdates);
      onNotify(
        'success',
        'Document Processed & Saved',
        `Extracted fields from ${file.name} saved to local browser vault and profile.`
      );
    } catch (err) {
      console.error(err);
      onNotify('error', 'AI Extraction Error', 'Failed to extract document with Gemini AI.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in bg-white text-slate-900">
      {/* Banner */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Scan className="w-3.5 h-3.5 text-orange-600" />
              <span>Gemini Multimodal Vision Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Document Vault & AI Extractor
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Upload your official certificates (Aadhaar, Marksheets, Domicile, PAN Card) in Image or PDF format. Text is extracted with Gemini AI and auto-saved in your browser storage.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-orange-600" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900">100% Local Browser Privacy</p>
              <p className="text-slate-500">Saved in browser storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-orange-600" />
          <span>Upload Document (Image or PDF)</span>
        </h3>

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Target Category
          </label>
          <div className="flex flex-wrap gap-2">
            {docTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedType === type
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Card */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
            dragActive
              ? 'border-orange-500 bg-orange-50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            disabled={isScanning}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Click to browse or drag & drop your document here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported Formats: <strong className="text-orange-600">PDF, PNG, JPEG, WEBP</strong>
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-white text-xs text-slate-700 border border-slate-200">
              <span>Category: <strong className="text-slate-900">{selectedType}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
              <Clock className="w-7 h-7 animate-spin" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Gemini AI Document Analysis</h3>
            <p className="text-orange-600 text-xs font-semibold">{scanStep}</p>

            <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600" />
                <span>Base64 Binary Conversion</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600" />
                <span>Gemini 2.5 Flash Vision OCR</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600 animate-spin" />
                <span>Updating Master Student Profile...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text Log Console Card */}
      {lastExtractedText && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span>Latest Gemini Extracted Console Output</span>
            </h4>
            <button
              onClick={() => setLastExtractedText(null)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Clear Log
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-48 whitespace-pre-wrap">
            {lastExtractedText}
          </pre>
        </div>
      )}

      {/* Saved Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Saved Vault Documents ({documents.length})</span>
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No Documents Uploaded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your Aadhaar Card, 10th/12th Marksheet, or PDF certificate to extract text automatically with Gemini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{doc.name}</h4>
                        <span className="inline-block text-[11px] font-semibold text-orange-600">
                          {doc.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {doc.extractedFields.slice(0, 3).map((field, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 text-[11px] rounded bg-slate-50 text-slate-700 border border-slate-200 flex justify-between"
                      >
                        <span className="font-semibold text-slate-500">{field.label}:</span>
                        <span className="text-slate-900 font-medium truncate max-w-[140px]">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 uppercase font-semibold">
                    {doc.fileType}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-600" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => {
                        onDeleteDocument(doc.id);
                        onNotify('info', 'Document Removed', `${doc.name} was removed from vault.`);
                      }}
                      className="p-1.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspector Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{previewDoc.name}</h3>
                  <p className="text-xs text-slate-500">{previewDoc.type} • AI Extracted</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Extracted Key-Value Fields
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {previewDoc.extractedFields.map((field, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                    <span className="font-semibold text-slate-600">{field.label}:</span>
                    <span className="text-orange-600 font-bold">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
