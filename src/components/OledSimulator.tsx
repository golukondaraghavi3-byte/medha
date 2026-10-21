import React from 'react';
import { Cpu, Wifi, Radio, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { HardwareState } from '../types';

interface OledSimulatorProps {
  hardwareState: HardwareState;
  onToggleHardware: () => void;
  onClearOled: () => void;
}

export const OledSimulator: React.FC<OledSimulatorProps> = ({
  hardwareState,
  onToggleHardware,
  onClearOled,
}) => {
  return (
    <div className="bg-[#0a1024] border border-cyan-900/50 rounded-2xl p-5 shadow-xl shadow-cyan-950/30">
      <div className="flex items-center justify-between pb-4 border-b border-cyan-950/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950/80 border border-cyan-700/50 rounded-lg text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              ESP32-S & 0.96&quot; OLED Hardware Module
            </h3>
            <p className="text-xs text-slate-400">
              I2C Bus (SDA: GPIO 21, SCL: GPIO 22) · 115200 Baud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHardware}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
              hardwareState.esp32Connected
                ? 'bg-emerald-950/80 border border-emerald-600/80 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-600/80 text-rose-300'
            }`}
          >
            {hardwareState.esp32Connected ? 'SERIAL: CONNECTED' : 'SERIAL: DISCONNECTED'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Physical 0.96" OLED Screen Replica (SSD1306 128x64 display) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-slate-900 border-4 border-slate-700 rounded-xl p-3 shadow-2xl relative">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5 px-1">
              <span>0.96&quot; I2C OLED (SSD1306)</span>
              <span className="text-cyan-400">128 × 64 PIXELS</span>
            </div>

            {/* Glass screen with scanlines */}
            <div className="oled-screen relative w-full h-36 rounded-md p-3 overflow-hidden flex flex-col justify-between select-none">
              {/* Header section (Yellow stripe in dual-color OLED) */}
              <div className="border-b border-amber-500/40 pb-1 flex items-center justify-between text-[11px] text-amber-400 font-bold tracking-wider">
                <span className="truncate">MEDHA 2K26 · AI</span>
                <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded">
                  OCT 24
                </span>
              </div>

              {/* Main Content Area (Cyan pixels in dual-color OLED) */}
              <div className="py-1 text-cyan-300 text-xs font-mono space-y-1">
                {hardwareState.oledText.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-tight truncate ${
                      idx === 0
                        ? 'font-bold text-white'
                        : idx === 1
                        ? 'text-cyan-200'
                        : 'text-cyan-400/90 text-[11px]'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Footer status bar */}
              <div className="pt-1 border-t border-cyan-800/40 flex items-center justify-between text-[9px] text-cyan-500/90 font-mono">
                <span>VIP REGISTRATION</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  LIVE
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

        {/* ESP32 Hardware, LEDs, Resistors & Bluetooth Speaker Status */}
        <div className="lg:col-span-5 space-y-3">
          {/* Dual LEDs indicator */}
          <div className="bg-[#060b19] border border-cyan-950 rounded-xl p-3">
            <span className="text-[11px] font-mono text-slate-400 block mb-2 font-medium">
              ESP32 HARDWARE OUTPUT INDICATORS
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Green LED (Recognized) */}
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                  hardwareState.greenLed
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-all ${
                    hardwareState.greenLed
                      ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]'
                      : 'bg-emerald-950/40'
                  }`}
                />
                <div className="text-[11px] font-mono">
                  <div className="font-bold">GREEN LED</div>
                  <div className="text-[10px] text-slate-400">GPIO 2 (330Ω)</div>
                </div>
              </div>

              {/* Red LED (Scanning / Error) */}
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                  hardwareState.redLed
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-all ${
                    hardwareState.redLed
                      ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                      : 'bg-rose-950/40'
                  }`}
                />
                <div className="text-[11px] font-mono">
                  <div className="font-bold">RED LED</div>
                  <div className="text-[10px] text-slate-400">GPIO 4 (330Ω)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bluetooth Speaker & Thermal Printer Bridge */}
          <div className="bg-[#060b19] border border-cyan-950 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Bluetooth Audio Speaker
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> PAIRED & ONLINE
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Mini Thermal Bluetooth Printer
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> READY TO PRINT
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClearOled}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-900/90 border border-slate-800 rounded-md transition-colors"
            >
              Reset OLED Screen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
