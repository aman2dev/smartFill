import { useState } from 'react';
import { getStoredSession, clearSession, UserSession } from './services/authService';
import { Navbar } from './components/Navbar';
import { PopupView } from './components/PopupView';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [session, setSession] = useState<UserSession | null>(getStoredSession());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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

  const handleAuthSuccess = (newSession: UserSession) => {
    setSession(newSession);
    addToast('success', 'Authenticated Successfully', `Welcome back, ${newSession.user.name}!`);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    addToast('info', 'Signed Out', 'Redirected to authentication page.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar
        activeTab="popup"
        setActiveTab={() => {}}
        documentCount={0}
        profileCompleteness={100}
        session={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <PopupView
          session={session}
          onOpenAuth={() => setIsAuthOpen(true)}
          onUpdateSession={(updatedSession) => setSession(updatedSession)}
          onNotify={addToast}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">smartFill AI Extension</span>
          <span>Temporary Cyber Cafe Customer Sessions • Encrypted Storage</span>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
