import React from 'react';
import { FileText, UserCheck, Puzzle, Zap, Upload, Sparkles, LogIn, LogOut } from 'lucide-react';
import main from '../services/imagetotext';
import type { UserSession } from '../services/authService';

interface NavbarProps {
  activeTab: 'vault' | 'profile' | 'popup';
  setActiveTab: (tab: 'vault' | 'profile' | 'popup') => void;
  documentCount: number;
  profileCompleteness: number;
  session: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  profileCompleteness,
  session,
  onOpenAuth,
  onLogout,
}) => {
  const creditsCount = session?.user?.credits ?? 50;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                smartFill
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-orange-600 border border-slate-200">
                v1.0 MV3
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal hidden sm:block">
              AI Government Exam Form Autofill Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-orange-500 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User Profile & Options</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'vault'
                ? 'bg-orange-500 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Vault</span>
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded font-semibold border ${
              activeTab === 'vault' ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}>
              {documentCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('popup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'popup'
                ? 'bg-orange-500 text-white font-semibold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            <span>Extension Popup</span>
          </button>
        </nav>

        {/* Top Right Corner: Credits Badge & Auth */}
        <div className="flex items-center space-x-3">
          
          {/* TOP RIGHT CREDITS DISPLAY BADGE */}
          <div 
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/20 border border-orange-300 text-orange-800 font-bold text-xs shadow-xs hover:scale-105 transition-all cursor-pointer group"
            title="Your smartFill AI Credits balance"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-orange-600 font-semibold tracking-wider uppercase">AI Credits</span>
              <span className="text-sm font-black text-orange-900">{creditsCount}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">Profile:</span>
            <span className="font-bold text-slate-900">{profileCompleteness}%</span>
            <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => main('/fakeId.pdf')}
            className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
            title="Test AI OCR Extraction on sample fakeId.pdf"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Test OCR</span>
          </button>

          {/* User Auth Button */}
          {session ? (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-3">
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {session.user.name?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {session.user.name}
              </span>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-t border-slate-200 bg-slate-50 p-2 gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg text-center ${
            activeTab === 'profile' ? 'bg-orange-500 text-white font-bold' : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg text-center ${
            activeTab === 'vault' ? 'bg-orange-500 text-white font-bold' : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Docs ({documentCount})
        </button>
        <button
          onClick={() => setActiveTab('popup')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg text-center ${
            activeTab === 'popup' ? 'bg-orange-500 text-white font-bold' : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Popup
        </button>
      </div>
    </header>
  );
};
