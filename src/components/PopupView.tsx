import { useState, useEffect } from 'react';
import type { UserProfile, StoredDocument } from '../types';
import { activeExamRecipe, universalEngineFiller } from '../services/contentScript';
import { Zap, ExternalLink, ShieldCheck, CheckCircle2, Play } from 'lucide-react';

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

  const handleFillFormClick = async () => {
    setIsFilling(true);
    setFillSuccess(false);

    const studentProfileData = {
      full_name: profile.fullName || 'Rahul Sharma',
      father_name: profile.fatherName || 'Mahesh Sharma',
      mother_name: profile.motherName || 'Sunita Sharma',
      dob: profile.dob || '15/08/1998',
      gender: profile.gender || 'Male',
      category: profile.category || 'OBC',
      email: profile.email || 'rahul.sharma@gmail.com',
      phone: profile.phone || '9876543210',
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
      universalEngineFiller(activeExamRecipe, studentProfileData);
    }

    await new Promise((r) => setTimeout(r, 500));
    setIsFilling(false);
    setFillSuccess(true);

    onNotify(
      'success',
      'Engine Injection Completed',
      'Matching fields (Name, Father/Mother name verification, Gender, Category, Aadhaar) auto-filled.'
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
    <div className="w-[360px] bg-white text-slate-900 p-5 space-y-4 font-sans border border-slate-200 rounded-2xl shadow-xl flex flex-col justify-between mx-auto">
      
      {/* Header Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900">
                smartFill
              </h1>
              <p className="text-[10px] text-slate-500">Extension Engine</p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-semibold">
            <span className={profileReady ? 'text-orange-600 font-bold' : 'text-slate-500'}>
              {profileReady ? 'Ready' : 'Setup Required'}
            </span>
          </div>
        </div>

        {/* Profile Status */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              User: {studentName || profile.fullName || 'Rahul Sharma'}
            </span>
            <span className="text-[10px] text-slate-500">
              {documents.length} Vault Documents Stored
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
        </div>

        {/* Action Button: Auto Fill */}
        <div className="space-y-2 pt-1">
          <button
            id="fillBtn"
            onClick={handleFillFormClick}
            disabled={!profileReady || isFilling}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Play className={`w-4 h-4 fill-white ${isFilling ? 'animate-spin' : ''}`} />
            <span>{isFilling ? 'Injecting Script...' : 'Auto Fill Active Form'}</span>
          </button>

          {fillSuccess && (
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <span>Universal Autofill Executed!</span>
            </div>
          )}
        </div>
      </div>

      {/* Options Dashboard Button */}
      <div className="pt-3 border-t border-slate-200">
        <button
          onClick={handleOpenOptions}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
        </button>
      </div>

    </div>
  );
};
