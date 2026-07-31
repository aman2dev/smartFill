import React from 'react';
import { ExternalLink, CheckCircle2, Award } from 'lucide-react';
import { POPULAR_EXAMS, PopularExam } from '../services/popularExams';

interface ExamLauncherProps {
  onSelectExam?: (exam: PopularExam) => void;
}

export const ExamLauncher: React.FC<ExamLauncherProps> = ({ onSelectExam }) => {
  const handleLaunchPortal = (exam: PopularExam) => {
    if (onSelectExam) {
      onSelectExam(exam);
    }
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: exam.portalUrl });
    } else {
      window.open(exam.portalUrl, '_blank');
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-orange-500 text-white rounded-lg shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Popular Pre-Mapped Exam Portals
            </h3>
            <p className="text-[11px] text-slate-500">
              Select an exam to launch official portal & auto-detect cached form schema
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
          Auto-Cached
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {POPULAR_EXAMS.map((exam) => (
          <div
            key={exam.id}
            onClick={() => handleLaunchPortal(exam)}
            className="group relative bg-white border border-slate-200 hover:border-orange-400 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                  {exam.shortCode}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${exam.badgeColor}`}>
                  {exam.status}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-700 line-clamp-1">
                {exam.title}
              </p>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                {exam.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {exam.domain}
              </span>
              <span className="flex items-center space-x-1 font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                <span>Launch</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
