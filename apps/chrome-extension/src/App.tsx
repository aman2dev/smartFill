import { useState, useEffect } from 'react';
import type { UserProfile, StoredDocument } from './types';
import { loadProfile, saveProfile, loadDocuments, saveDocuments } from './services/storage';
import { Navbar } from './components/Navbar';
import { DocumentVault } from './components/DocumentVault';
import { UserProfileForm } from './components/UserProfileForm';
import { PopupView } from './components/PopupView';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'vault' | 'profile' | 'popup'>('profile');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPopupOnlyView, setIsPopupOnlyView] = useState(false);

  useEffect(() => {
    const loadedDocs = loadDocuments();
    setDocuments(loadedDocs);

    const rootElem = document.getElementById('root');
    const viewType = rootElem?.getAttribute('data-view');
    if (viewType === 'popup' || window.location.pathname.endsWith('popup.html')) {
      setIsPopupOnlyView(true);
      setActiveTab('popup');
    } else if (viewType === 'options' || window.location.pathname.endsWith('options.html')) {
      setActiveTab('profile');
    }
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const handleUploadDocument = (doc: StoredDocument, profileUpdates?: Partial<UserProfile>) => {
    const updatedDocs = [doc, ...documents];
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);

    if (profileUpdates && Object.keys(profileUpdates).length > 0) {
      const mergedProfile = { ...profile, ...profileUpdates };
      setProfile(mergedProfile);
      saveProfile(mergedProfile);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
  };

  const calculateCompleteness = (): number => {
    const keysToCheck: (keyof UserProfile)[] = [
      'fullName',
      'fatherName',
      'motherName',
      'gender',
      'category',
      'aadhaarNumber',
      'addressLine1',
      'city',
      'town',
    ];
    let filled = 0;
    keysToCheck.forEach((k) => {
      if (profile[k]) filled++;
    });
    return Math.round((filled / keysToCheck.length) * 100);
  };

  if (isPopupOnlyView) {
    return (
      <div className="bg-white min-h-screen p-4 flex justify-center items-center">
        <PopupView
          profile={profile}
          documents={documents}
          onOpenDashboard={() => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            } else {
              window.open('/options.html', '_blank');
            }
          }}
          onNotify={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={documents.length}
        profileCompleteness={calculateCompleteness()}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {activeTab === 'profile' && (
          <UserProfileForm
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onNotify={addToast}
          />
        )}

        {activeTab === 'vault' && (
          <DocumentVault
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onNotify={addToast}
          />
        )}

        {activeTab === 'popup' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
                Chrome Extension Popup Window Preview
              </h3>
              <PopupView
                profile={profile}
                documents={documents}
                onOpenDashboard={() => setActiveTab('profile')}
                onNotify={addToast}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>smartFill Extension • Pure White UI</span>
          <span className="text-slate-600 font-medium">All data stored locally in browser storage</span>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
