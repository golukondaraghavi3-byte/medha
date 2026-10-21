import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LiveStation } from './components/LiveStation';
import { OledSimulator } from './components/OledSimulator';
import { SmsAndPrinterStation } from './components/SmsAndPrinterStation';
import { TalkingRobot } from './components/TalkingRobot';
import { StudentMediaHub } from './components/StudentMediaHub';
import { AdminDatabaseModal } from './components/AdminDatabaseModal';
import { VipGreetingCard } from './components/VipGreetingCard';
import { CodeExportModal } from './components/CodeExportModal';
import { INITIAL_FACULTY_DATABASE } from './data/facultyDatabase';
import { FacultyMember, HardwareState, EventLog } from './types';
import { speakRobotVoice } from './utils/speechSynthesis';
import { Sparkles, Bot, ShieldCheck, Activity, Terminal, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'robot' | 'gallery' | 'logs' | 'hardware'>('live');
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(INITIAL_FACULTY_DATABASE);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember>(INITIAL_FACULTY_DATABASE[0]);

  // Modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isVipCardOpen, setIsVipCardOpen] = useState(false);
  const [isCodeExportOpen, setIsCodeExportOpen] = useState(false);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);

  // Hardware State
  const [hardwareState, setHardwareState] = useState<HardwareState>({
    esp32Connected: true,
    port: 'COM3 (USB-Serial)',
    baudRate: 115200,
    greenLed: false,
    redLed: true,
    oledText: ['MEDHA 2K26 READY', 'OCTOBER 24, 2026', 'WEBCAM CONNECTED', 'STANDBY MODE'],
    bluetoothSpeaker: true,
    thermalPrinter: true,
  });

  // Event Logs for Dashboard Reports
  const [logs, setLogs] = useState<EventLog[]>([
    {
      id: 'log-1',
      timestamp: '10:00:12 AM',
      category: 'ESP32_HARDWARE',
      message: 'ESP32 Module initialized on COM3 @ 115200 baud. I2C OLED (0x3C) online.',
      level: 'success',
    },
    {
      id: 'log-2',
      timestamp: '10:00:15 AM',
      category: 'FACE_RECOGNITION',
      message: 'Loaded 36 Faculty encodings from PDF pages into neural memory.',
      level: 'info',
    },
    {
      id: 'log-3',
      timestamp: '10:00:18 AM',
      category: 'SECURITY',
      message: 'Privacy shield engaged: 36 Faculty phone numbers masked for public visitors.',
      level: 'info',
    },
  ]);

  const addLog = (
    category: EventLog['category'],
    message: string,
    level: EventLog['level'] = 'info',
    details?: string
  ) => {
    const newLog: EventLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category,
      message,
      level,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleOpenVipPass = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    setIsVipCardOpen(true);
    addLog(
      'SMS_DISPATCH',
      `Opened VIP Greeting Card & Pass for ${faculty.salutation} ${faculty.name} [Token: ${faculty.vipToken}]`,
      'success'
    );
  };

  const handleFacultyVoiceTest = (faculty: FacultyMember) => {
    const text = `Welcome ${faculty.salutation} ${faculty.name} to Medha 2K26 on October 24th, 2026!`;
    speakRobotVoice(text, { pitch: 1.15 });
    addLog('VOICE_COMMAND', `Manual voice test for ${faculty.name}: "${text}"`, 'info');
  };

  const handleFacultySmsTest = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    addLog('SMS_DISPATCH', `Dispatched instant SMS test to +91 ${faculty.phone} for ${faculty.name}`, 'success');
  };

  const handleFacultyPrinterTest = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    addLog('PRINTER', `Thermal mini printer spooled token slip for ${faculty.name}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminAuthed={isAdminAuthed}
        onOpenAdminAuth={() => setIsAdminModalOpen(true)}
        onOpenCodeExport={() => setIsCodeExportOpen(true)}
        totalFacultyCount={facultyList.length}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* TAB 1: Live AI Station */}
        {activeTab === 'live' && (
          <div className="space-y-8">
            {/* Primary Webcam Face Recognition & Voice Orchestrator */}
            <LiveStation
              facultyList={facultyList}
              currentFaculty={selectedFaculty}
              onSelectFaculty={(f) => setSelectedFaculty(f)}
              hardwareState={hardwareState}
              setHardwareState={setHardwareState}
              onOpenVipPass={handleOpenVipPass}
              onLogEvent={addLog}
            />

            {/* Hardware OLED Display & ESP32 Bridge */}
            <OledSimulator
              hardwareState={hardwareState}
              onToggleHardware={() => {
                setHardwareState((prev) => ({
                  ...prev,
                  esp32Connected: !prev.esp32Connected,
                }));
                addLog(
                  'ESP32_HARDWARE',
                  `ESP32 Hardware status toggled: ${!hardwareState.esp32Connected ? 'Connected' : 'Disconnected'}`,
                  'info'
                );
              }}
              onClearOled={() => {
                setHardwareState((prev) => ({
                  ...prev,
                  greenLed: false,
                  redLed: true,
                  oledText: ['MEDHA 2K26 READY', 'OCTOBER 24, 2026', 'AWAITING SCAN', 'STANDBY'],
                }));
                addLog('ESP32_HARDWARE', 'OLED Screen buffer cleared to Standby', 'info');
              }}
            />

            {/* Real-time SMS Dispatcher & Mini Bluetooth Thermal Printer */}
            <SmsAndPrinterStation
              faculty={selectedFaculty}
              onOpenVipPass={handleOpenVipPass}
              onLogEvent={addLog}
            />

            {/* Quick Navigation Banner to Talking Robot & Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => setActiveTab('robot')}
                className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 to-[#0c183a] border border-cyan-800/50 hover:border-cyan-400 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-cyan-600/30 border border-cyan-500/40 p-1 shrink-0">
                    <img src="/robot.jpeg" alt="Robot" className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Speak to Medha Robot
                    </h3>
                    <p className="text-xs text-slate-400">
                      Talking Tom voice mimic mode &amp; AI answers
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#0e1236] border border-purple-800/50 hover:border-purple-400 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/40 p-2 text-purple-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      Student HD Media Hub (2,000+ Photos)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Share, Relive &amp; Enjoy with mobile QR scan
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Speak to Robot */}
        {activeTab === 'robot' && <TalkingRobot />}

        {/* TAB 3: Student HD Media Hub */}
        {activeTab === 'gallery' && <StudentMediaHub />}

        {/* TAB 4: Detailed Hardware Bridge */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <OledSimulator
              hardwareState={hardwareState}
              onToggleHardware={() => {
                setHardwareState((prev) => ({
                  ...prev,
                  esp32Connected: !prev.esp32Connected,
                }));
              }}
              onClearOled={() => {
                setHardwareState((prev) => ({
                  ...prev,
                  greenLed: false,
                  redLed: true,
                  oledText: ['MEDHA 2K26 READY', 'OCTOBER 24, 2026', 'AWAITING SCAN', 'STANDBY'],
                }));
              }}
            />

            <SmsAndPrinterStation
              faculty={selectedFaculty}
              onOpenVipPass={handleOpenVipPass}
              onLogEvent={addLog}
            />
          </div>
        )}

        {/* TAB 5: Real-time System Logs */}
        {activeTab === 'logs' && (
          <div className="bg-[#091024] border border-cyan-900/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">
                  Real-time System Audit &amp; Operation Logs
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                ACTIVE AUDIT ENGINE · {logs.length} ENTRIES
              </span>
            </div>

            <div className="overflow-y-auto max-h-[600px] space-y-2 font-mono text-xs">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#040816] border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          log.level === 'success'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.level === 'warning'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {log.category}
                      </span>
                    </div>
                    <div className="text-slate-200">{log.message}</div>
                    {log.details && <div className="text-[11px] text-slate-400">{log.details}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-950/80 bg-[#040816] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <p>
          MEDHA 2K26 · College AI &amp; Robotics Mega Event · October 24, 2026
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Architected by A. Renuka &amp; Department of Computer Science &amp; AI
        </p>
      </footer>

      {/* Modals */}
      <AdminDatabaseModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        facultyList={facultyList}
        isAdminAuthed={isAdminAuthed}
        onAuthenticate={setIsAdminAuthed}
        logs={logs}
        onTriggerFacultyTest={(f) => {
          setSelectedFaculty(f);
          setActiveTab('live');
        }}
        onTriggerSmsTest={handleFacultySmsTest}
        onTriggerPrinterTest={handleFacultyPrinterTest}
        onTriggerVoiceTest={handleFacultyVoiceTest}
      />

      <VipGreetingCard
        faculty={selectedFaculty}
        isOpen={isVipCardOpen}
        onClose={() => setIsVipCardOpen(false)}
        onSpeakToRobot={() => {
          setIsVipCardOpen(false);
          setActiveTab('robot');
        }}
      />

      <CodeExportModal
        isOpen={isCodeExportOpen}
        onClose={() => setIsCodeExportOpen(false)}
      />
    </div>
  );
}
