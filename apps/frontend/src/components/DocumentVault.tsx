import React, { useState } from 'react';
import type { StoredDocument, DocumentType } from '../types';
import { processDocumentWithAI } from '../services/mockAi';
import {
  Upload,
  FileCheck,
  Trash2,
  Eye,
  Sparkles,
  ShieldCheck,
  FileText,
  Scan,
  X,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';

interface DocumentVaultProps {
  documents: StoredDocument[];
  onUploadDocument: (doc: StoredDocument, profileUpdates?: any) => void;
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

    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      onNotify('error', 'Invalid File Format', 'Please upload a PDF, PNG, or JPEG document.');
      return;
    }

    try {
      setIsScanning(true);
      setScanStep('Reading document binary...');
      await new Promise(r => setTimeout(r, 500));

      setScanStep('Running AI OCR & Layout Recognition...');
      await new Promise(r => setTimeout(r, 700));

      setScanStep('Extracting key entities & context fields...');
      const result = await processDocumentWithAI(file, selectedType);

      setScanStep('Structuring data & matching to exam profile schema...');
      await new Promise(r => setTimeout(r, 400));

      const newDoc: StoredDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: result.documentType,
        fileType: ext as any,
        sizeBytes: file.size,
        uploadDate: new Date().toISOString(),
        status: 'processed',
        confidenceScore: result.confidenceScore,
        extractedFields: result.extractedFields,
      };

      onUploadDocument(newDoc, result.profileUpdates);
      onNotify(
        'success',
        'Document Processed with AI',
        `Extracted ${result.extractedFields.length} fields from ${file.name} with ${result.confidenceScore}% confidence.`
      );
    } catch (err) {
      onNotify('error', 'AI Extraction Error', 'Failed to scan document. Please try again.');
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
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Smart Document Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Local Browser Document Vault
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Upload your official certificates (Aadhaar, Marksheets, Domicile). Data is processed with AI locally & saved securely in your browser.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">100% Privacy Protected</p>
              <p className="text-slate-400">Stored in browser local storage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          <span>Upload Document for AI Extraction</span>
        </h3>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Document Category
          </label>
          <div className="flex flex-wrap gap-2">
            {docTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedType === type
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative overflow-hidden ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
              : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/50 hover:bg-slate-950'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            disabled={isScanning}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Upload className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click to browse or drag & drop your document here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported Formats: <span className="text-cyan-300 font-medium">PDF, JPEG, PNG</span> (Max 10MB)
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              <span>Targeting: <strong className="text-white">{selectedType}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="w-full h-1 bg-slate-800 relative overflow-hidden rounded-full mb-6">
              <div className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 w-1/2 animate-pulse"></div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-lg shadow-cyan-500/30">
              <Scan className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Analyzing Document with AI</h3>
            <p className="text-cyan-400 text-sm font-medium mb-4">{scanStep}</p>

            <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>OCR Text Recognition</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Government Exam Entity Extraction</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Updating Local Exam Profile...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Saved Documents ({documents.length})</span>
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-300">No Documents Uploaded Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your Aadhaar Card, 10th/12th Marksheet or Degree to enable instant smart form filling.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl transition-all shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{doc.name}</h4>
                        <span className="inline-block text-[11px] font-semibold text-cyan-400">
                          {doc.type}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {doc.confidenceScore}% AI Confidence
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {doc.extractedFields.slice(0, 3).map((field, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-[10px] rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        <strong>{field.label}:</strong> {field.value}
                      </span>
                    ))}
                    {doc.extractedFields.length > 3 && (
                      <span className="px-2 py-1 text-[10px] rounded-md bg-slate-800 text-slate-400">
                        +{doc.extractedFields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Format: {doc.fileType.toUpperCase()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => {
                        onDeleteDocument(doc.id);
                        onNotify('info', 'Document Deleted', `${doc.name} was removed from local vault.`);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
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

      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{previewDoc.name}</h3>
                  <p className="text-xs text-slate-400">{previewDoc.type} • AI Scanned</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Extracted Key-Value Fields ({previewDoc.extractedFields.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {previewDoc.extractedFields.map((field, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">{field.label}:</span>
                      <p className="text-cyan-300 font-bold mt-0.5">{field.value}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                      {field.confidence}% match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium text-sm hover:bg-cyan-500 transition-colors"
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
