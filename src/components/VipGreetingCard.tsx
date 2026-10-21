import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Key, CheckCircle, ShieldCheck, X, ExternalLink, QrCode } from 'lucide-react';
import { FacultyMember } from '../types';

interface VipGreetingCardProps {
  faculty: FacultyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSpeakToRobot: () => void;
}

export const VipGreetingCard: React.FC<VipGreetingCardProps> = ({
  faculty,
  isOpen,
  onClose,
  onSpeakToRobot,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [keyTurning, setKeyTurning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false);
      setKeyTurning(true);

      const unlockTimer = setTimeout(() => {
        setIsUnlocked(true);
        setKeyTurning(false);

        // Fire celebratory golden sparkles and confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#f59e0b', '#10b981', '#ffffff'],
        });

        const secondBlast = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#38bdf8', '#fbbf24', '#10b981'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#38bdf8', '#fbbf24', '#10b981'],
          });
        }, 400);

        return () => clearTimeout(secondBlast);
      }, 900);

      return () => clearTimeout(unlockTimer);
    }
  }, [isOpen]);

  if (!isOpen || !faculty) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Floating Decorative Balloons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[10%] bottom-0 w-8 h-10 rounded-full bg-cyan-500/30 blur-[1px] animate-[balloonRise_5s_ease-out_infinite]" />
        <div className="absolute left-[25%] bottom-0 w-12 h-14 rounded-full bg-amber-400/30 blur-[1px] animate-[balloonRise_6s_ease-out_1s_infinite]" />
        <div className="absolute right-[20%] bottom-0 w-10 h-12 rounded-full bg-blue-500/30 blur-[1px] animate-[balloonRise_5.5s_ease-out_0.5s_infinite]" />
        <div className="absolute right-[8%] bottom-0 w-14 h-16 rounded-full bg-emerald-400/30 blur-[1px] animate-[balloonRise_7s_ease-out_2s_infinite]" />
      </div>

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1630] via-[#091124] to-[#040817] border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isUnlocked ? (
          /* Temple Run Vault Key Turning Unlock Sequence */
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-[0_0_40px_rgba(251,191,36,0.7)] transition-transform duration-700 ${
                keyTurning ? 'rotate-[360deg] scale-110' : ''
              }`}
            >
              <div className="w-full h-full bg-[#0a1024] rounded-full flex items-center justify-center">
                <Key className="w-10 h-10 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300 font-serif tracking-wide">
                UNLOCKING MEDHA 2K26 VIP PASS...
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Authenticating Faculty Token for {faculty.name}
              </p>
            </div>
          </div>
        ) : (
          /* Unlocked Grand Greeting Card */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Top Golden Header */}
            <div className="text-center space-y-2 border-b border-amber-500/30 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-mono tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                OFFICIAL VIP EVENT INVITATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 font-serif">
                MEDHA 2K26 TECH FEST
              </h2>
              <p className="text-xs text-cyan-300 font-mono">
                October 24, 2026 · College Auditorium & Robotics Arena
              </p>
            </div>

            {/* Faculty & Mascot Card */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-[#070d1e]/80 border border-cyan-800/40 rounded-2xl p-4">
              {/* Faculty Photo */}
              <div className="sm:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  <img
                    src={faculty.photoUrl}
                    alt={faculty.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/robot.jpeg';
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-amber-300 font-mono py-0.5">
                    VERIFIED VIP
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold text-white truncate max-w-[150px]">
                  {faculty.salutation} {faculty.name}
                </div>
                <div className="text-[11px] text-cyan-400">{faculty.designation}</div>
                <div className="text-[10px] text-slate-400">{faculty.department}</div>
              </div>

              {/* Medha Robot Mascot with Welcome Message */}
              <div className="sm:col-span-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-400/60 shrink-0 shadow-md">
                    <img
                      src="/robot.jpeg"
                      alt="Medha Robot"
                      className="w-full h-full object-cover animate-robot-bounce"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-cyan-400 font-semibold">
                      MEDHA 2K26 ROBOT SAYS:
                    </div>
                    <div className="text-sm font-semibold text-white">
                      &quot;Welcome, esteemed {faculty.salutation} {faculty.name}!&quot;
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 leading-relaxed font-sans">
                  &ldquo;{faculty.customThought}&rdquo;
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Registered &amp; Verified
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Token: {faculty.vipToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Present this pass or SMS at entrance desk</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    onSpeakToRobot();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Speak to Medha Robot</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
