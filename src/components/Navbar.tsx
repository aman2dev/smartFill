import { FileText, UserCheck, Puzzle, ShieldCheck, Zap } from 'lucide-react';
import callGemini from '../services/imagetotext';

interface NavbarProps {
  activeTab: 'vault' | 'profile' | 'popup';
  setActiveTab: (tab: 'vault' | 'profile' | 'popup') => void;
  documentCount: number;
  profileCompleteness: number;
}

export const Navbar = ({
  activeTab,
  setActiveTab,
  documentCount,
  profileCompleteness,
}: NavbarProps) => {

 
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                smartFill
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                v1.0 MV3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              AI Government Exam Form Autofill Engine
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User Profile & Options</span>
          </button>
         <div className='size-11 bg-black flex items-center justify-center'>
          <button className='size-11 bg-red' onClick={callGemini}>run</button>
         </div>
            

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Vault</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              {documentCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('popup')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'popup'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            <span>Extension Popup Preview</span>
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Profile:</span>
            <span className="font-bold text-emerald-400">{profileCompleteness}%</span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">Storage Ready</span>
          </div>
        </div>
      </div>

      <div className="md:hidden flex border-t border-slate-800 bg-slate-950 p-2 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
            activeTab === 'profile' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
            activeTab === 'vault' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          Docs ({documentCount})
        </button>
        <button
          onClick={() => setActiveTab('popup')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
            activeTab === 'popup' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          Popup
        </button>
      </div>
    </header>
  );
};
