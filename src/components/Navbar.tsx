import React from 'react';
import { Bot, ShieldCheck, Lock, Activity, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'live' | 'robot' | 'gallery' | 'logs' | 'hardware';
  setActiveTab: (tab: 'live' | 'robot' | 'gallery' | 'logs' | 'hardware') => void;
  isAdminAuthed: boolean;
  onOpenAdminAuth: () => void;
  onOpenCodeExport: () => void;
  onOpenVipPass: () => void;
  totalFacultyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminAuthed,
  onOpenAdminAuth,
  onOpenCodeExport,
  onOpenVipPass
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070c1e]/90 backdrop-blur-md border-b border-cyan-950/60 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('live')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/robot.jpeg"
                alt="Medha Robot Mascot"
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Bot className="w-5 h-5 text-white hidden" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>MEDHA 2K26</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  AI ROBOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">October 24, 2026 · College Mega Event</p>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('live')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'live'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Live AI Station
          </button>

          <button
            onClick={() => setActiveTab('robot')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'robot'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Speak to Robot
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'gallery'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Student HD Media Hub
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'hardware'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            ESP32 & OLED Bridge
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'logs'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Real-time Logs
          </button>
        </nav>

        {/* Zone 3: Primary Action & Auth Lock */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenVipPass}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/60 hover:bg-amber-900 rounded-lg transition-all whitespace-nowrap shadow-sm shadow-amber-500/20"
            title="Open VIP Greeting Card & QR Pass"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Pass &amp; QR</span>
          </button>

          <button
            onClick={onOpenCodeExport}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:border-cyan-500 hover:text-white transition-all whitespace-nowrap"
            title="Download ESP32 and Python code for VS Code"
          >
            <span>VS Code</span>
          </button>

          <button
            onClick={onOpenAdminAuth}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shadow-sm ${
              isAdminAuthed
                ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
            }`}
          >
            {isAdminAuthed ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Unlocked (Renuka)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Database Lock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
