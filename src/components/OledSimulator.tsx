import React, { useState, useEffect } from 'react';
import { Cpu, Clock, Download, Play, Square, RefreshCw, CheckCircle2, ChevronRight, Zap, FileCode, Check } from 'lucide-react';
import { HardwareState, FacultyMember } from '../types';
import { INITIAL_FACULTY_DATABASE } from '../data/facultyDatabase';

interface OledSimulatorProps {
  hardwareState: HardwareState;
  onToggleHardware: () => void;
  onClearOled: () => void;
  currentFaculty?: FacultyMember | null;
  onSelectFacultyForOled?: (faculty: FacultyMember) => void;
}

export const OledSimulator: React.FC<OledSimulatorProps> = ({
  hardwareState,
  onToggleHardware,
  onClearOled,
  currentFaculty,
  onSelectFacultyForOled,
}) => {
  // Real-Time Clock State (HH:MM:SS)
  const [realTime, setRealTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [selectedFacultyIndex, setSelectedFacultyIndex] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCodePreview, setShowCodePreview] = useState<boolean>(false);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync if external faculty selected
  useEffect(() => {
    if (currentFaculty) {
      const idx = INITIAL_FACULTY_DATABASE.findIndex((f) => f.id === currentFaculty.id);
      if (idx !== -1) setSelectedFacultyIndex(idx);
    }
  }, [currentFaculty]);

  // Auto-Cycle all 36 Faculty on OLED
  useEffect(() => {
    let cycleInterval: any = null;
    if (isAutoCycling) {
      cycleInterval = setInterval(() => {
        setSelectedFacultyIndex((prev) => (prev + 1) % INITIAL_FACULTY_DATABASE.length);
      }, 3500);
    }
    return () => {
      if (cycleInterval) clearInterval(cycleInterval);
    };
  }, [isAutoCycling]);

  const activeFaculty = INITIAL_FACULTY_DATABASE[selectedFacultyIndex];

  const handleDownloadIno = () => {
    const link = document.createElement('a');
    link.href = '/esp32_medha_oled_firmware.ino';
    link.download = 'esp32_medha_oled_firmware.ino';
    link.click();
  };

  return (
    <div className="bg-[#0a1024] border border-cyan-900/50 rounded-2xl p-5 shadow-xl shadow-cyan-950/30 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950/80 border border-cyan-700/50 rounded-lg text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>ESP32 &amp; 0.96&quot; OLED Embedded System</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                ALL 36 FACULTY LOADED
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              I2C Bus (SDA: D21, SCL: D22) · 115200 Baud · Internal RTC Real-Time Clock
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadIno}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            title="Download separate standalone .ino firmware file for ESP32"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ESP32 Code (.ino)</span>
          </button>

          <button
            onClick={onToggleHardware}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors ${
              hardwareState.esp32Connected
                ? 'bg-emerald-950/80 border border-emerald-600/80 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-600/80 text-rose-300'
            }`}
          >
            {hardwareState.esp32Connected ? 'SERIAL: CONNECTED' : 'SERIAL: DISCONNECTED'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Physical 0.96" OLED Screen Replica (SSD1306 128x64 display) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-[360px] bg-slate-900 border-4 border-slate-700 rounded-2xl p-3.5 shadow-2xl relative">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5 px-1">
              <span>0.96&quot; I2C OLED (SSD1306)</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300 font-bold">{realTime}</span>
              </span>
            </div>

            {/* Glass OLED Screen with Dual-Color Styling (Yellow Top + Cyan Bottom) */}
            <div className="oled-screen relative w-full h-40 rounded-lg p-3 overflow-hidden flex flex-col justify-between select-none">
              {/* Yellow Zone: Top Title & Real-Time Clock */}
              <div className="border-b border-amber-500/50 pb-1 flex items-center justify-between text-[11px] text-amber-400 font-mono font-bold tracking-wider">
                <span className="truncate">MEDHA 2K26</span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                  {realTime}
                </span>
              </div>

              {/* Cyan Zone: Faculty Name & Details */}
              <div className="py-1 text-cyan-300 text-xs font-mono space-y-0.5">
                <div className="text-[10px] text-cyan-400/80 font-bold flex justify-between">
                  <span>WELCOME VIP #{activeFaculty.id}/36</span>
                  <span className="text-emerald-400">CONFIRMED</span>
                </div>
                <div className="font-bold text-white text-sm truncate leading-tight">
                  {activeFaculty.salutation} {activeFaculty.name}
                </div>
                <div className="text-[11px] text-cyan-200 truncate">{activeFaculty.designation}</div>
                <div className="text-[10px] text-cyan-400/80 truncate">{activeFaculty.department}</div>
              </div>

              {/* Footer: VIP Token & Event Date */}
              <div className="pt-1 border-t border-cyan-800/50 flex items-center justify-between text-[9px] text-cyan-400 font-mono">
                <span>{activeFaculty.vipToken}</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  OCT 24, 2026
                </span>
              </div>
            </div>

            {/* OLED Pinouts */}
            <div className="flex justify-around text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-800 pt-1">
              <span>GND</span>
              <span>VCC (3.3V)</span>
              <span className="text-cyan-400 font-bold">SCL (D22)</span>
              <span className="text-cyan-400 font-bold">SDA (D21)</span>
            </div>
          </div>
        </div>

        {/* Right: 36 Faculty OLED Switcher & Auto-Cycle Controls */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Faculty Direct Selector */}
          <div className="bg-[#060b19] border border-cyan-950 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-slate-400 block font-medium">
                CHOOSE FROM ALL 36 FACULTY FOR OLED:
              </label>
              <span className="text-[10px] font-mono text-cyan-400">
                {activeFaculty.id} of 36
              </span>
            </div>

            <select
              value={selectedFacultyIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedFacultyIndex(idx);
                setIsAutoCycling(false);
                onSelectFacultyForOled?.(INITIAL_FACULTY_DATABASE[idx]);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {INITIAL_FACULTY_DATABASE.map((f, i) => (
                <option key={f.id} value={i}>
                  #{f.id} - {f.name} ({f.designation} - {f.department})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsAutoCycling(!isAutoCycling)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all ${
                  isAutoCycling
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isAutoCycling ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop Auto-Cycle</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Auto-Cycle All 36 on OLED</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedFacultyIndex((prev) => (prev + 1) % 36);
                  setIsAutoCycling(false);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition-colors"
                title="Next faculty on OLED"
              >
                Next (→)
              </button>
            </div>
          </div>

          {/* Dual LEDs indicator */}
          <div className="bg-[#060b19] border border-cyan-950 rounded-xl p-3">
            <span className="text-[11px] font-mono text-slate-400 block mb-2 font-medium">
              ESP32 HARDWARE OUTPUT INDICATORS
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Green LED (GPIO 2) */}
              <div
                className={`p-2 rounded-lg border flex items-center gap-2.5 transition-all ${
                  hardwareState.greenLed || true
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                <div className="text-[11px] font-mono">
                  <div className="font-bold">GREEN LED</div>
                  <div className="text-[9px] text-slate-400">GPIO 2 (330Ω)</div>
                </div>
              </div>

              {/* Red LED (GPIO 4) */}
              <div
                className={`p-2 rounded-lg border flex items-center gap-2.5 transition-all ${
                  isAutoCycling
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    isAutoCycling ? 'bg-amber-400 animate-pulse' : 'bg-rose-900'
                  }`}
                />
                <div className="text-[11px] font-mono">
                  <div className="font-bold">RED LED</div>
                  <div className="text-[9px] text-slate-400">GPIO 4 (330Ω)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Code File Info */}
          <div className="p-3 bg-gradient-to-r from-slate-900 to-[#071026] border border-cyan-800/50 rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-cyan-400 font-bold block">Standalone File Available:</span>
              <span className="text-slate-400 text-[11px]">/public/esp32_medha_oled_firmware.ino</span>
            </div>
            <button
              onClick={handleDownloadIno}
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-sans font-medium transition-colors"
            >
              Get .INO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
