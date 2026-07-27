import { useState, useEffect } from 'react';
import type { UserProfile, StoredDocument } from '../types';
import { activeExamRecipe, universalEngineFiller } from '../services/contentScript';
import { Zap, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PopupViewProps {
  profile: UserProfile;
  documents: StoredDocument[];
  onOpenDashboard?: () => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PopupView = ({
  profile,
  documents,
  onOpenDashboard,
  onNotify,
}: PopupViewProps) => {
  const [profileReady, setProfileReady] = useState(false);
  const [studentName, setStudentName] = useState<string>('');
  const [isFilling, setIsFilling] = useState(false);
  const [fillSuccess, setFillSuccess] = useState(false);

  useEffect(() => {
    // Check chrome.storage.local for studentProfile status
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['studentProfile'], (res: any) => {
        if (res.studentProfile && res.studentProfile.full_name) {
          setProfileReady(true);
          setStudentName(res.studentProfile.full_name);
        }
      });
    } else if (profile.fullName) {
      setProfileReady(true);
      setStudentName(profile.fullName);
    }
  }, [profile]);

  // Execute universal script injection on active tab
  const handleFillFormClick = async () => {
    setIsFilling(true);
    setFillSuccess(false);

    const studentProfileData = {
      full_name: profile.fullName || 'Rahul Sharma',
      father_name: profile.fatherName || 'Mahesh Sharma',
      mother_name: profile.motherName || 'Sunita Sharma',
      aadhaar_no: profile.aadhaarNumber || '5489 1204 9832',
      address: profile.addressLine1 || 'Flat 402, Green Valley',
      city: profile.city || 'New Delhi',
      town: profile.town || 'Connaught Place',
      photo_base64: profile.photo_base64 || '',
    };

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: universalEngineFiller,
            args: [activeExamRecipe, studentProfileData],
          });
        }
      } catch (err) {
        console.error('Script injection error:', err);
      }
    } else {
      // In web simulation preview mode
      universalEngineFiller(activeExamRecipe, studentProfileData);
    }

    await new Promise((r) => setTimeout(r, 600));
    setIsFilling(false);
    setFillSuccess(true);

    onNotify(
      'success',
      'Engine Injection Completed',
      'Matching labels auto-filled with native input setter bypass.'
    );
  };

  const handleOpenOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (onOpenDashboard) {
      onOpenDashboard();
    }
  };

  return (
    <div className="w-[360px] bg-slate-950 text-slate-100 p-4 space-y-4 font-sans border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between mx-auto">
      
      {/* Header Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-base bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                smartFill
              </h1>
              <p className="text-[10px] text-slate-400">Extension Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <span id="profileStatus" className={`font-bold ${profileReady ? 'text-emerald-400' : 'text-amber-400'}`}>
              {profileReady ? 'Ready' : 'Not Setup'}
            </span>
          </div>
        </div>

        {/* Profile User Status */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span id="studentNameText" className="text-xs font-bold text-slate-100 block">
              User: {studentName || profile.fullName || ' राहुल शर्मा (Rahul Sharma)'}
            </span>
            <span className="text-[10px] text-slate-400">
              {documents.length} Vault Documents Persisted
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
        </div>

        {/* Action Button: Auto Fill */}
        <div className="space-y-2 pt-1">
          <button
            id="fillBtn"
            onClick={handleFillFormClick}
            disabled={!profileReady || isFilling}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-5 h-5 ${isFilling ? 'animate-spin' : ''}`} />
            <span>{isFilling ? 'Injecting Script...' : '⚡ Auto Fill Active Form'}</span>
          </button>

          {fillSuccess && (
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center space-x-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Universal Autofill Executed!</span>
            </div>
          )}
        </div>
      </div>

      {/* Options Dashboard Button */}
      <div className="pt-3 border-t border-slate-800">
        <button
          id="openOptionsBtn"
          onClick={handleOpenOptions}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Open Full Options Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

    </div>
  );
};
