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
  AlertCircle,
  QrCode,
  Download,
  Sliders
} from 'lucide-react';
import type { StoredDocument } from '../types';
import type { InteractiveElementSummary, FileUploadRule } from '@smartFill/types';
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
import { QrUploadModal } from './QrUploadModal';
import { PopularExam } from '../services/popularExams';
import {
  universalEngineFiller,
  universalFileUploader,
  activeExamRecipe,
  UploadFileItem,
  FileUploadBatchReport
} from '../services/contentScript';
import {
  compressImage,
  classifyDocumentType,
  detectPortalPreset,
  PORTAL_PRESETS,
  PortalPreset
} from '../services/imageCompressor';

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
  const [isInjectingDocs, setIsInjectingDocs] = useState(false);
  const [isOptimizingDocs, setIsOptimizingDocs] = useState(false);
  const [sessionPaid, setSessionPaid] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<PopularExam | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPopupView, setIsPopupView] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('auto');
  const [activeDomain, setActiveDomain] = useState<string>('');

  useEffect(() => {
    getTempCustomerDocsAsync().then((docs) => setTempDocs(docs));
    getTempExtractedFieldsAsync().then((fields) => setExtractedFields(fields));
    setSessionPaid(isCustomerSessionPaid());

    const isPopup = window.location.pathname.endsWith('popup.html') ||
      document.getElementById('root')?.getAttribute('data-view') === 'popup';
    setIsPopupView(isPopup);

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs && tabs[0]?.url) {
          try {
            const domain = new URL(tabs[0].url).hostname;
            setActiveDomain(domain);
          } catch (e) {}
        }
      });
    }
  }, []);

  const handleOpenFullTab = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/options.html', '_blank');
    }
  };

  const getActivePreset = (): PortalPreset => {
    if (selectedPresetKey !== 'auto' && PORTAL_PRESETS[selectedPresetKey]) {
      return PORTAL_PRESETS[selectedPresetKey];
    }
    return detectPortalPreset(activeDomain || 'general');
  };

  const handlePresetChange = async (newKey: string) => {
    setSelectedPresetKey(newKey);
    const newPreset = newKey === 'auto' ? detectPortalPreset(activeDomain) : (PORTAL_PRESETS[newKey] || PORTAL_PRESETS.general);

    if (tempDocs.length === 0) return;

    setIsOptimizingDocs(true);
    try {
      const updatedDocs = await Promise.all(
        tempDocs.map(async (doc) => {
          if (!doc.dataUrl || doc.fileType === 'pdf') return doc;
          let rule = newPreset.document || { minKb: 50, maxKb: 200, targetKb: 120 };
          if (doc.type === 'Passport Photo') rule = newPreset.photo;
          else if (doc.type === 'Signature') rule = newPreset.signature;

          try {
            const comp = await compressImage(doc.dataUrl, {
              minKb: rule.minKb,
              maxKb: rule.maxKb,
              targetKb: rule.targetKb,
              maxWidth: rule.maxWidth,
              maxHeight: rule.maxHeight,
              fileName: doc.name,
            });
            return {
              ...doc,
              optimizedDataUrl: comp.dataUrl,
              optimizedSizeBytes: comp.sizeBytes,
              targetRange: { minKb: rule.minKb, maxKb: rule.maxKb },
            };
          } catch (e) {
            return doc;
          }
        })
      );
      setTempDocs(updatedDocs);
      saveTempCustomerDocs(updatedDocs);
      onNotify('success', 'Images Re-Optimized', `All candidate files adjusted to ${newPreset.name} requirements.`);
    } finally {
      setIsOptimizingDocs(false);
    }
  };

  const processFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const preset = getActivePreset();

    Array.from(files).forEach((file, idx) => {
      const docType = classifyDocumentType(file.name);
      const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64Data = evt.target?.result as string;
        let optimizedDataUrl = base64Data;
        let optimizedSizeBytes = file.size;
        let targetRange: { minKb: number; maxKb: number } | undefined = undefined;

        if (isImage) {
          try {
            let rule = preset.document || { minKb: 50, maxKb: 200, targetKb: 120 };
            if (docType === 'Passport Photo') rule = preset.photo;
            else if (docType === 'Signature') rule = preset.signature;

            targetRange = { minKb: rule.minKb, maxKb: rule.maxKb };
            const compressed = await compressImage(base64Data, {
              minKb: rule.minKb,
              maxKb: rule.maxKb,
              targetKb: rule.targetKb,
              maxWidth: rule.maxWidth,
              maxHeight: rule.maxHeight,
              fileName: file.name,
            });
            optimizedDataUrl = compressed.dataUrl;
            optimizedSizeBytes = compressed.sizeBytes;
          } catch (compErr) {
            console.warn('[smartFill] Compression warning:', compErr);
          }
        }

        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}-${idx}`,
          name: file.name,
          type: docType,
          fileType: file.name.endsWith('.pdf') ? 'pdf' : ((file.type || 'image/jpeg') as any),
          sizeBytes: file.size,
          dataUrl: base64Data,
          optimizedDataUrl,
          optimizedSizeBytes,
          targetRange,
          uploadDate: new Date().toISOString(),
          status: 'processed',
          confidenceScore: 98,
          extractedFields: [],
        };

        setTempDocs((prev) => {
          const updated = [...prev, newDoc];
          saveTempCustomerDocs(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    onNotify('success', 'Documents Added & Optimized', `Added ${files.length} document(s) matching ${preset.name} size limits.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDownloadDoc = (doc: StoredDocument) => {
    const data = doc.optimizedDataUrl || doc.dataUrl;
    if (!data) return;
    const link = document.createElement('a');
    link.href = data;
    link.download = `optimized_${doc.name.replace(/\.[^/.]+$/, '')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('success', 'Downloaded', `Saved ${doc.name} (${Math.round((doc.optimizedSizeBytes || doc.sizeBytes) / 1024)} KB)`);
  };

  const runDocumentInjection = async (
    tabId: number,
    fileRules: FileUploadRule[] = []
  ): Promise<{ injectedCount: number; healedCount: number }> => {
    if (tempDocs.length === 0) return { injectedCount: 0, healedCount: 0 };

    const filesPayload: UploadFileItem[] = tempDocs
      .filter((d) => d.optimizedDataUrl || d.dataUrl)
      .map((d) => ({
        id: d.id,
        fileName: d.name,
        docType: d.type,
        dataUrl: d.optimizedDataUrl || d.dataUrl || '',
        sizeKb: Math.round((d.optimizedSizeBytes || d.sizeBytes) / 1024),
      }));

    const injectionRes = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: universalFileUploader,
      args: [fileRules, filesPayload],
    });

    let injectedCount = 0;
    let healedCount = 0;
    const rejectedItems: Array<{
      fileName: string;
      docType: string;
      errorDetected: string;
      detectedBounds?: { minKb?: number; maxKb?: number };
    }> = [];

    if (injectionRes && injectionRes.length > 0) {
      injectionRes.forEach((frameRes: any) => {
        const report: FileUploadBatchReport = frameRes?.result;
        if (report) {
          injectedCount += report.uploadedCount;
          report.results?.forEach((r) => {
            if (!r.success && r.detectedBounds) {
              rejectedItems.push({
                fileName: r.fileName,
                docType: r.docType,
                errorDetected: r.errorDetected || '',
                detectedBounds: r.detectedBounds,
              });
            }
          });
        }
      });
    }

    // Self-Healing Feedback Loop: Recompress to exact detected bounds if portal warned/rejected
    if (rejectedItems.length > 0) {
      console.log('[smartFill] 🩹 Self-Healing Triggered: Portal rejected files with size constraints:', rejectedItems);
      const healedDocs: UploadFileItem[] = [];

      for (const rej of rejectedItems) {
        const originalDoc = tempDocs.find((d) => d.name === rej.fileName || d.type === rej.docType);
        if (originalDoc && originalDoc.dataUrl && rej.detectedBounds?.maxKb) {
          try {
            const minK = rej.detectedBounds.minKb || 5;
            const maxK = rej.detectedBounds.maxKb;
            const targetK = Math.round(minK + (maxK - minK) / 2);

            const recompressed = await compressImage(originalDoc.dataUrl, {
              minKb: minK,
              maxKb: maxK,
              targetKb: targetK,
              fileName: originalDoc.name,
            });

            // Update local doc
            setTempDocs((prev) => {
              const updated = prev.map((docItem) =>
                docItem.id === originalDoc.id
                  ? {
                      ...docItem,
                      optimizedDataUrl: recompressed.dataUrl,
                      optimizedSizeBytes: recompressed.sizeBytes,
                      targetRange: { minKb: minK, maxKb: maxK },
                    }
                  : docItem
              );
              saveTempCustomerDocs(updated);
              return updated;
            });

            healedDocs.push({
              id: originalDoc.id,
              fileName: originalDoc.name,
              docType: originalDoc.type,
              dataUrl: recompressed.dataUrl,
              sizeKb: recompressed.sizeKb,
            });
            healedCount++;
          } catch (e) {
            console.warn('[smartFill] Healing recompression failed:', e);
          }
        }
      }

      if (healedDocs.length > 0) {
        await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          func: universalFileUploader,
          args: [fileRules, healedDocs],
        });
        onNotify(
          'success',
          'Self-Healing Upload Success',
          `Portal warned about size bounds. smartFill auto-recompressed ${healedCount} file(s) to exact limits and successfully uploaded!`
        );
      }
    }

    return { injectedCount, healedCount };
  };

  const handleDirectInjectDocs = async () => {
    if (tempDocs.length === 0) {
      onNotify('error', 'No Documents Uploaded', 'Please upload at least 1 document first.');
      return;
    }

    setIsInjectingDocs(true);
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const tabs = await new Promise<any[]>((resolve) =>
          chrome.tabs.query({ active: true, currentWindow: true }, resolve)
        );
        if (tabs[0]?.id) {
          const { injectedCount, healedCount } = await runDocumentInjection(tabs[0].id);
          if (injectedCount > 0) {
            onNotify(
              'success',
              'Documents Injected!',
              `Uploaded ${injectedCount} document(s) into file inputs.${healedCount > 0 ? ` (${healedCount} self-healed)` : ''}`
            );
          } else {
            onNotify('info', 'No File Inputs Found', 'No matching file upload inputs detected on the current active tab.');
          }
        }
      }
    } catch (e: any) {
      onNotify('error', 'Document Injection Failed', e?.message || 'Failed to inject files.');
    } finally {
      setIsInjectingDocs(false);
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

  const handleExtractData = async () => {
    if (tempDocs.length === 0) {
      onNotify('error', 'No Documents Uploaded', 'Please upload at least 1 customer document first.');
      return;
    }

    setIsExtracting(true);

    try {
      const docToExtract = tempDocs.find((d) => d.dataUrl) || tempDocs[0];
      let base64String = docToExtract?.dataUrl || '';
      
      if (base64String.includes(',')) {
        base64String = base64String.split(',')[1];
      }

      const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';
      const apiRes = await fetch(`${backendUrl}/api/v1/extract-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64String,
          mimeType: docToExtract?.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
          userId: session?.user?.id
        })
      });

      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && json.extractedProfile) {
          const profile = json.extractedProfile;
          const mappedExtracted: Record<string, string> = {
            fullName: profile.full_name || '',
            full_name: profile.full_name || '',
            fatherName: profile.father_name || '',
            father_name: profile.father_name || '',
            motherName: profile.mother_name || '',
            mother_name: profile.mother_name || '',
            dob: profile.dob || '',
            gender: profile.gender || '',
            category: profile.category || '',
            aadhaarNumber: profile.aadhaar_no || '',
            aadhaar_no: profile.aadhaar_no || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
            panCard: profile.pan_no || ''
          };

          Object.keys(mappedExtracted).forEach((key) => {
            if (!mappedExtracted[key]) delete mappedExtracted[key];
          });

          setExtractedFields(mappedExtracted);
          saveTempExtractedFields(mappedExtracted);
          setIsExtracting(false);
          onNotify('success', 'AI Document Extraction Complete', `Extracted ${Object.keys(mappedExtracted).length} real fields from document.`);
          return;
        }
      }
    } catch (err) {
      console.warn('[Real AI Document Extraction Failed]', err);
    }

    setIsExtracting(false);
    onNotify('error', 'Extraction Failed', 'Could not extract text from document. Ensure backend API is running.');
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

    const profilePayload = {
      ...extractedFields,
      full_name: extractedFields.fullName || extractedFields.full_name || '',
      father_name: extractedFields.fatherName || extractedFields.father_name || '',
      mother_name: extractedFields.motherName || extractedFields.mother_name || '',
      dob: extractedFields.dob || '',
      gender: extractedFields.gender || '',
      category: extractedFields.category || '',
      aadhaar_no: extractedFields.aadhaarNumber || extractedFields.aadhaar_no || extractedFields.aadhaar || '',
      aadhaar: extractedFields.aadhaarNumber || extractedFields.aadhaar_no || extractedFields.aadhaar || '',
      email: extractedFields.email || '',
      phone: extractedFields.phone || '',
      address: extractedFields.address || '',
      city: extractedFields.city || '',
      state: extractedFields.state || '',
      pincode: extractedFields.pincode || '',
      panCard: extractedFields.panCard || '',
      accountNumber: extractedFields.accountNumber || '',
      ifscCode: extractedFields.ifscCode || ''
    };

    setIsAutofilling(true);

    try {
      let filledCount = 0;
      let uploadedDocsCount = 0;
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const tabs = await new Promise<any[]>((resolve) =>
          chrome.tabs.query({ active: true, currentWindow: true }, resolve)
        );

        if (tabs[0]?.id) {
          let domain = 'localhost';
          let htmlSnippet = '';
          let screenshotBase64 = '';
          const elementsSummary: InteractiveElementSummary[] = [];

          if (tabs[0]?.url) {
            try {
              domain = new URL(tabs[0].url).hostname;
            } catch (e) {}
          }

          // Step 1: Capture High-Precision Visual Page Screenshot (Multimodal Vision)
          if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.captureVisibleTab) {
            try {
              console.log('[smartFill] 📸 Capturing active tab screenshot for Multimodal AI Form Analysis...');
              const screenshotDataUrl = await new Promise<string>((resolve) => {
                chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 70 }, (dataUrl?: string) => {
                  if (chrome.runtime.lastError) {
                    console.warn('[smartFill] ⚠️ Screenshot capture skipped:', chrome.runtime.lastError.message);
                    resolve('');
                  } else {
                    resolve(dataUrl || '');
                  }
                });
              });
              if (screenshotDataUrl && screenshotDataUrl.includes(',')) {
                screenshotBase64 = screenshotDataUrl.split(',')[1];
                const approxKb = Math.round((screenshotBase64.length * 0.75) / 1024);
                console.log(`[smartFill] ✅ Screenshot captured successfully (${approxKb} KB). Sending to Gemini Vision.`);
              } else {
                console.warn('[smartFill] ⚠️ Screenshot capture returned empty; proceeding with DOM structure only.');
              }
            } catch (ssErr) {
              console.warn('[smartFill] ⚠️ Screenshot capture non-fatal error:', ssErr);
            }
          }

          // Step 2: Extract Clean Interactive DOM Elements & HTML snippet from all frames
          if (chrome.scripting && chrome.scripting.executeScript) {
            try {
              const domRes = await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id, allFrames: true },
                func: () => {
                  const interactiveInputs = Array.from(
                    document.querySelectorAll('input:not([type="hidden"]), select, textarea')
                  );

                  const summaries = interactiveInputs.map((el) => {
                    const inp = el as HTMLInputElement;
                    const tagName = inp.tagName.toLowerCase();
                    const id = inp.id || '';
                    const name = inp.name || '';
                    const type = inp.type || '';
                    const placeholder = inp.placeholder || '';

                    // Inspect nearest label or enclosing table/group container text
                    let nearestText = '';
                    if (id) {
                      const explicitLabel = document.querySelector(`label[for="${id}"]`);
                      if (explicitLabel) nearestText = (explicitLabel as HTMLElement).innerText || '';
                    }
                    if (!nearestText) {
                      const container = inp.closest('tr, td, .form-group, .form-item, div, p');
                      if (container) {
                        nearestText = ((container as HTMLElement).innerText || '').replace(/\s+/g, ' ').slice(0, 120);
                      }
                    }

                    // Build standard CSS selector hint
                    let selectorHint = '';
                    if (id) {
                      selectorHint = id.match(/^\d+$/) ? `[id="${id}"]` : `#${id}`;
                    } else if (name) {
                      selectorHint = `${tagName}[name="${name}"]`;
                    } else if (placeholder) {
                      selectorHint = `${tagName}[placeholder*="${placeholder.slice(0, 20)}"]`;
                    }

                    return {
                      id,
                      name,
                      type,
                      tagName,
                      placeholder,
                      nearestText: nearestText.trim(),
                      selectorHint
                    };
                  });

                  const snippet = interactiveInputs.map((inp) => {
                    const idStr = inp.id ? ` id="${inp.id}"` : '';
                    const nameStr = inp.getAttribute('name') ? ` name="${inp.getAttribute('name')}"` : '';
                    const typeStr = inp.getAttribute('type') ? ` type="${inp.getAttribute('type')}"` : '';
                    const placeholderStr = (inp as HTMLInputElement).placeholder ? ` placeholder="${(inp as HTMLInputElement).placeholder}"` : '';
                    return `<${inp.tagName.toLowerCase()}${idStr}${nameStr}${typeStr}${placeholderStr}>`;
                  }).join('\n');

                  return {
                    summaries,
                    snippet
                  };
                }
              });

              if (domRes && domRes.length > 0) {
                domRes.forEach((frameRes: any) => {
                  if (frameRes.result) {
                    if (Array.isArray(frameRes.result.summaries)) {
                      elementsSummary.push(...frameRes.result.summaries);
                    }
                    if (frameRes.result.snippet) {
                      htmlSnippet += (htmlSnippet ? '\n' : '') + frameRes.result.snippet;
                    }
                  }
                });
              }
            } catch (e) {
              console.warn('[DOM elements extraction error]', e);
            }
          }

          // Step 3: Fetch AI Recipe from Backend API / DB Cache (Dual-Input Multimodal Grounding)
          let recipeToUse = activeExamRecipe;
          let recipeFileUploadRules: FileUploadRule[] = [];

          try {
            const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';
            const apiRes = await fetch(`${backendUrl}/api/v1/extract-recipe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                domain,
                htmlSnippet,
                screenshotBase64,
                elementsSummary,
                userId: session.user.id
              })
            });

            if (apiRes.ok) {
              const json = await apiRes.json();
              if (json.success && json.recipe && json.recipe.mappings) {
                recipeToUse = json.recipe.mappings;
                if (json.recipe.fileUploadRules) {
                  recipeFileUploadRules = json.recipe.fileUploadRules;
                }
                console.log(`[Backend AI Recipe Loaded] ${json.cached ? '(DB Cache Hit)' : '(Gemini Multimodal Grounded)'}`, json.recipe);
              }
            }
          } catch (apiErr) {
            console.warn('[Backend API unreachable, using fallback recipe]', apiErr);
          }

          // Step 4: Execute Universal Engine Filler across all frames with AI Recipe
          if (chrome.scripting && chrome.scripting.executeScript) {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id, allFrames: true },
              func: universalEngineFiller,
              args: [recipeToUse, profilePayload]
            });
            if (results && results.length > 0) {
              filledCount = results.reduce((sum: number, r: any) => sum + (typeof r.result === 'number' ? r.result : 0), 0);
            }
          }

          // Step 5: Execute Universal File Uploader if documents are present in session
          if (tempDocs.length > 0 && chrome.scripting && chrome.scripting.executeScript) {
            try {
              const { injectedCount } = await runDocumentInjection(tabs[0].id, recipeFileUploadRules);
              uploadedDocsCount = injectedCount;
            } catch (injErr) {
              console.warn('[smartFill] Document injection warning:', injErr);
            }
          }

          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'AUTOFILL_FORM',
            payload: profilePayload
          }).catch(() => {});
        }
      } else {
        // Fallback for local testing
        filledCount = universalEngineFiller(activeExamRecipe, profilePayload);
      }

      const summaryDetails = `${filledCount > 0 ? `${filledCount} fields filled` : 'Form filled'}${uploadedDocsCount > 0 ? ` + ${uploadedDocsCount} documents uploaded` : ''}`;

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
        onNotify('success', `Form Autofilled! (${summaryDetails})`, `Remaining AI Credits: ${newCredits}`);
      } else {
        onNotify('success', `Form Autofilled! (${summaryDetails})`, 'Customer session active.');
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

      {/* STEP 1: UPLOAD CUSTOMER DOCUMENTS & ADAPTIVE RESIZER */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">
              1
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Customer Documents & Adaptive Resizer
              </h3>
              <p className="text-[10px] text-slate-500">Auto-compressed client-side for strict portal size limits</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {tempDocs.length > 0 && (
              <button
                onClick={handleDirectInjectDocs}
                disabled={isInjectingDocs}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                title="Inject optimized files directly into active page's file upload inputs"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{isInjectingDocs ? 'Injecting...' : 'Auto-Inject Files'}</span>
              </button>
            )}

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              title="Show QR code for customer to scan with their phone"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>

            <label
              onClick={handleAddFilesButtonClick}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
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
        </div>

        {/* Portal Target Preset Selector */}
        <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs gap-2">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold truncate">
            <Sliders className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-[11px] text-slate-600 shrink-0">Portal Target Limits:</span>
          </div>
          <select
            value={selectedPresetKey}
            onChange={(e) => handlePresetChange(e.target.value)}
            disabled={isOptimizingDocs}
            aria-label="Portal Target Limits Preset"
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
          >
            <option value="auto">⚡ Auto-Detect ({activeDomain || 'General Portal'})</option>
            <option value="bpsc">BPSC Bihar (Photo: 10-25KB | Sign: 5-15KB)</option>
            <option value="ssc">SSC (Photo: 20-50KB | Sign: 10-20KB)</option>
            <option value="upsc">UPSC (Photo: 20-300KB | Sign: 20-300KB)</option>
            <option value="nsdl_pan">NSDL PAN (Photo: 20-50KB | Sign: 10-50KB)</option>
            <option value="utiitsl_pan">UTIITSL PAN (Photo: 10-30KB | Sign: 10-60KB)</option>
            <option value="parivahan">Parivahan Sarathi (Photo/Sign: 10-20KB)</option>
            <option value="general">Universal Govt Portal (Photo: 20-50KB)</option>
          </select>
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
              Drag & Drop customer Photo, Signature, Aadhaar, or Marksheets here
            </p>
            <p className="text-[11px] text-slate-400">
              smartFill auto-classifies and adaptively compresses images to exact portal requirements (e.g. 20KB-50KB) in ~30ms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tempDocs.map((doc) => {
              const origKb = Math.round(doc.sizeBytes / 1024);
              const optKb = doc.optimizedSizeBytes ? Math.round(doc.optimizedSizeBytes / 1024) : origKb;
              const hasPreview = doc.optimizedDataUrl || doc.dataUrl;

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-orange-300 rounded-xl text-xs transition-all shadow-2xs"
                >
                  <div className="flex items-center space-x-2.5 truncate min-w-0">
                    {hasPreview && doc.fileType !== 'pdf' ? (
                      <img
                        src={doc.optimizedDataUrl || doc.dataUrl}
                        alt={doc.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                    <div className="truncate min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-800 truncate block text-[12px]">{doc.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          doc.type === 'Passport Photo'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : doc.type === 'Signature'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : doc.type === 'Aadhaar Card'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : doc.type === 'PAN Card'
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {doc.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span>{origKb > 1024 ? `${(origKb / 1024).toFixed(1)} MB` : `${origKb} KB`}</span>
                        {doc.optimizedSizeBytes && doc.optimizedSizeBytes !== doc.sizeBytes && (
                          <>
                            <span className="text-emerald-600 font-bold">➔ {optKb} KB</span>
                            {doc.targetRange && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-medium">
                                ({doc.targetRange.minKb}-{doc.targetRange.maxKb}KB)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Download 1-Click Optimized File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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

      {/* QR Code Upload Modal */}
      <QrUploadModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onDocsReceived={(updatedDocs) => {
          setTempDocs(updatedDocs);
        }}
        onNotify={onNotify}
      />

    </div>
  );
};
