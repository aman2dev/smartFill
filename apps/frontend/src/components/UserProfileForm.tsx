import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { User, ShieldCheck, Download, Save, Image, CheckCircle2 } from 'lucide-react';

interface UserProfileFormProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  profile,
  onSaveProfile,
  onNotify,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [photoBase64, setPhotoBase64] = useState<string>(profile.photo_base64 || '');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    // Load studentProfile from chrome.storage.local if available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['studentProfile'], (res: any) => {
        if (res.studentProfile) {
          const data = res.studentProfile;
          setFormData((prev) => ({
            ...prev,
            fullName: data.full_name || prev.fullName,
            fatherName: data.father_name || prev.fatherName,
            motherName: data.mother_name || prev.motherName,
            aadhaarNumber: data.aadhaar_no || prev.aadhaarNumber,
            addressLine1: data.address || prev.addressLine1,
            city: data.city || prev.city,
            town: data.town || prev.town,
          }));
          if (data.photo_base64) {
            setPhotoBase64(data.photo_base64);
          }
        }
      });
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setPhotoBase64(base64Str);
      setFormData((prev) => ({ ...prev, photo_base64: base64Str }));
      onNotify('info', 'Photo Loaded', 'Profile photo converted to base64 for storage.');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profileData = {
      full_name: formData.fullName,
      father_name: formData.fatherName,
      mother_name: formData.motherName,
      aadhaar_no: formData.aadhaarNumber,
      address: formData.addressLine1,
      city: formData.city,
      town: formData.town,
      photo_base64: photoBase64,
    };

    // Save to chrome.storage.local if running in extension mode
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ studentProfile: profileData }, () => {
        setStatusMessage('Profile saved successfully in Chrome Storage!');
        setTimeout(() => setStatusMessage(''), 3000);
      });
    }

    onSaveProfile({ ...formData, photo_base64: photoBase64 });
    onNotify('success', 'Student Profile Saved', 'Profile details persisted for universal auto fill.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>Master Profile Management</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Student Profile Details
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Fill your master details once. The extension will automatically populate matching fields on any government exam portal.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `student_profile.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              onNotify('info', 'Exported JSON', 'Profile backup downloaded.');
            }}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {statusMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Photo Upload & Preview Section */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Applicant Passport Photo
          </label>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-28 h-32 rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden relative group">
              {photoBase64 ? (
                <img id="photo_preview" src={photoBase64} alt="Applicant Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2 text-slate-500">
                  <Image className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                  <span className="text-[10px]">No Photo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <input
                type="file"
                id="photo_input"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Converts image to Base64 string for local browser storage persistence.
              </p>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name (English / Hindi) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Father's Name
            </label>
            <input
              type="text"
              id="father_name"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              placeholder="e.g. Mahesh Sharma"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mother's Name
            </label>
            <input
              type="text"
              id="mother_name"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              placeholder="e.g. Sunita Sharma"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Aadhaar Card Number
            </label>
            <input
              type="text"
              id="aadhaar_no"
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
              placeholder="e.g. 5489 1204 9832"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Permanent Address
            </label>
            <input
              type="text"
              id="address"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="Flat/House No, Street Name"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. New Delhi"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Town
            </label>
            <input
              type="text"
              id="town"
              value={formData.town || ''}
              onChange={(e) => setFormData({ ...formData, town: e.target.value })}
              placeholder="e.g. Connaught Place"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Saved locally for instant Chrome extension auto-filling</span>
          </div>

          <button
            type="submit"
            id="saveBtn"
            className="flex items-center space-x-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
