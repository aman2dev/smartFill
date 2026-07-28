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
    // Sync with state or chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['studentProfile'], (res: any) => {
        if (res.studentProfile) {
          const data = res.studentProfile;
          setFormData((prev) => ({
            ...prev,
            fullName: data.full_name || prev.fullName,
            fatherName: data.father_name || prev.fatherName,
            motherName: data.mother_name || prev.motherName,
            gender: data.gender || prev.gender,
            category: data.category || prev.category,
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
    } else {
      setFormData(profile);
    }
  }, [profile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setPhotoBase64(base64Str);
      setFormData((prev) => ({ ...prev, photo_base64: base64Str }));
      onNotify('info', 'Photo Uploaded', 'Passport photo saved for auto-fill.');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profileData = {
      full_name: formData.fullName,
      father_name: formData.fatherName,
      mother_name: formData.motherName,
      gender: formData.gender,
      category: formData.category,
      aadhaar_no: formData.aadhaarNumber,
      address: formData.addressLine1,
      city: formData.city,
      town: formData.town,
      photo_base64: photoBase64,
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ studentProfile: profileData }, () => {
        setStatusMessage('Master profile saved in Chrome Storage!');
        setTimeout(() => setStatusMessage(''), 3000);
      });
    }

    onSaveProfile({ ...formData, photo_base64: photoBase64 });
    onNotify('success', 'Master Profile Saved', 'Saved for instant form auto-fill on exam portals.');
  };

  return (
    <div className="space-y-6 animate-fade-in bg-white text-slate-900">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>Master Profile Management</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Application Details
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Fill your details once or extract them automatically from documents. The extension populates matching inputs on BPSC, SSC, UPSC & other exam portals.
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
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {statusMessage && (
          <div className="p-3.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-orange-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Photo Upload Section */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Applicant Passport Photo
          </label>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-28 h-32 rounded-xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden relative shadow-xs">
              {photoBase64 ? (
                <img id="photo_preview" src={photoBase64} alt="Applicant Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <Image className="w-8 h-8 mx-auto mb-1 text-slate-400" />
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
                className="block text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Saved in local browser storage for quick uploading on exam forms.
              </p>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name (English / Hindi) <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Father's Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Father's Name
            </label>
            <input
              type="text"
              id="father_name"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              placeholder="e.g. Mahesh Sharma"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Mother's Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mother's Name
            </label>
            <input
              type="text"
              id="mother_name"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              placeholder="e.g. Sunita Sharma"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Gender Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Gender / Sex
            </label>
            <select
              id="gender"
              value={formData.gender || ''}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male (पुरुष)</option>
              <option value="Female">Female (महिला)</option>
              <option value="Other">Other (अन्य)</option>
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category / Community
            </label>
            <select
              id="category"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            >
              <option value="">Select Category</option>
              <option value="General">General / Unreserved (UR)</option>
              <option value="OBC">OBC (Other Backward Class)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
            </select>
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Aadhaar Card Number
            </label>
            <input
              type="text"
              id="aadhaar_no"
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
              placeholder="e.g. 5489 1204 9832"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Permanent Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Permanent Address
            </label>
            <input
              type="text"
              id="address"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="Flat/House No, Street Name"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              City / District
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. New Delhi"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Town */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Town / Tehsil
            </label>
            <input
              type="text"
              id="town"
              value={formData.town || ''}
              onChange={(e) => setFormData({ ...formData, town: e.target.value })}
              placeholder="e.g. Connaught Place"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>Saved in browser storage for BPSC, SSC, UPSC form filling</span>
          </div>

          <button
            type="submit"
            id="saveBtn"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Master Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
