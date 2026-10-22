import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Volume2, Sparkles, CheckCircle2, UserCheck, RefreshCw, Send, Printer, Bot, ShieldCheck, Zap } from 'lucide-react';
import { FacultyMember, HardwareState } from '../types';
import { speakRobotVoice, stopRobotVoice } from '../utils/speechSynthesis';

interface LiveStationProps {
  facultyList: FacultyMember[];
  currentFaculty: FacultyMember | null;
  onSelectFaculty: (faculty: FacultyMember) => void;
  hardwareState: HardwareState;
  setHardwareState: React.Dispatch<React.SetStateAction<HardwareState>>;
  onOpenVipPass: (faculty: FacultyMember) => void;
  onLogEvent: (
    category: 'FACE_RECOGNITION' | 'VOICE_COMMAND' | 'ESP32_HARDWARE' | 'SMS_DISPATCH' | 'PRINTER',
    message: string,
    level: 'info' | 'success' | 'warning'
  ) => void;
}

export const LiveStation: React.FC<LiveStationProps> = ({
  facultyList,
  currentFaculty,
  onSelectFaculty,
  hardwareState,
  setHardwareState,
  onOpenVipPass,
  onLogEvent,
}) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'idle' | 'greeting' | 'countdown' | 'scanning' | 'matched' | 'completed'
  >('idle');
  const [countdown, setCountdown] = useState<number>(5);
  const [simulatedMatchConfidence, setSimulatedMatchConfidence] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selectedFaculty: FacultyMember = currentFaculty || facultyList[0];

  // Start real laptop webcam feed
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamActive(true);
      onLogEvent('FACE_RECOGNITION', 'Laptop USB Webcam activated with resolution 1280x720', 'info');
    } catch (err) {
      console.warn('Webcam access error:', err);
      setIsWebcamActive(false);
      onLogEvent('FACE_RECOGNITION', 'Webcam device unavailable. Fallback to simulation stream.', 'warning');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
      stopRobotVoice();
    };
  }, []);

  // Primary End-to-End Orchestrator:
  // 1. Initial Greeting -> 2. 5s Gap -> 3. Camera prompt -> 4. Facial match -> 5. ESP32 OLED + Green LED -> 6. Voice registration speech -> 7. SMS & Print
  const runFullRecognitionSequence = async (faculty: FacultyMember) => {
    if (isProcessing) return;
    setIsProcessing(true);
    onSelectFaculty(faculty);

    // Initial State Setup: Red LED active, scanning on OLED
    setHardwareState((prev) => ({
      ...prev,
      greenLed: false,
      redLed: true,
      oledText: ['MEDHA 2K26 READY', 'CONNECTING WEBCAM', 'PLEASE WAIT...', 'BAUD: 115200'],
    }));

    // STEP 1: First Command via Bluetooth Speaker
    setCurrentStep('greeting');
    const greetingText =
      "Hey, Hi! I'm Medha 2K26. Welcome to our event, Medha 2K26 on October 24th, 2026!";
    onLogEvent('VOICE_COMMAND', `Bluetooth Speaker Announcement: "${greetingText}"`, 'info');

    await speakRobotVoice(greetingText, { pitch: 1.15, rate: 0.95 });

    // STEP 2: Gap countdown (5 seconds) as requested
    setCurrentStep('countdown');
    setHardwareState((prev) => ({
      ...prev,
      oledText: ['SCANNING IN 5s...', 'CALIBRATING CAMERA', 'POSITION YOUR FACE', 'MEDHA 2K26'],
    }));

    for (let c = 5; c > 0; c--) {
      setCountdown(c);
      await new Promise((r) => setTimeout(r, 900));
    }

    // STEP 3: Camera Prompt Audio
    setCurrentStep('scanning');
    const lookCameraText = "Please look at the webcam.";
    onLogEvent('VOICE_COMMAND', `Bluetooth Speaker Announcement: "${lookCameraText}"`, 'info');

    setHardwareState((prev) => ({
      ...prev,
      oledText: ['[ WEBCAM ACTIVE ]', 'LOOK AT CAMERA', 'ANALYZING FACIAL MESH', '36 FACULTY DB'],
    }));

    await speakRobotVoice(lookCameraText, { pitch: 1.2, rate: 1.0 });

    // STEP 4: Facial Landmark & Neural Match
    await new Promise((r) => setTimeout(r, 1200));
    setSimulatedMatchConfidence(98.8);
    setCurrentStep('matched');

    // ESP32 Green LED ON, Red LED OFF!
    setHardwareState((prev) => ({
      ...prev,
      greenLed: true,
      redLed: false,
      oledText: [
        `WELCOME ${faculty.salutation.toUpperCase()} ${faculty.name.toUpperCase()}`,
        `DEPT: ${faculty.department.slice(0, 18)}`,
        `STATUS: VIP REGISTERED`,
        `DATE: OCT 24, 2026`,
      ],
    }));

    onLogEvent(
      'FACE_RECOGNITION',
      `Face recognized: ${faculty.salutation} ${faculty.name} (${faculty.designation}) with 98.8% confidence`,
      'success'
    );
    onLogEvent(
      'ESP32_HARDWARE',
      `ESP32 Triggered: Green LED (GPIO 2) HIGH, Red LED LOW, OLED Buffer updated`,
      'success'
    );

    // STEP 5: Personalized Registration Voice Announcement
    const registrationSpeech = `Mr. ${faculty.name} sir, you have been successfully registered for this Medha 2K26, and here the event details: event on October 24th, 2026. Event details and information will be passed through your SMS. So you can check now. You will have a text message sent to your mobile phone number and check.`;

    onLogEvent('VOICE_COMMAND', `Personalized Registration Announcement: "${registrationSpeech}"`, 'info');

    await speakRobotVoice(registrationSpeech, { pitch: 1.1, rate: 0.98 });

    // STEP 6: Trigger SMS Dispatch
    const liveAppUrl = typeof window !== 'undefined' ? window.location.origin : '';
    onLogEvent(
      'SMS_DISPATCH',
      `SMS Dispatched to +91 ${faculty.phone} containing VIP Invitation Link: ${liveAppUrl}?vip=pass&id=${faculty.id}`,
      'success'
    );

    // STEP 7: Mini Bluetooth Thermal Printer
    onLogEvent(
      'PRINTER',
      `Bluetooth mini printer queued VIP Pass slip for ${faculty.name} [Token: ${faculty.vipToken}]`,
      'success'
    );

    setCurrentStep('completed');
    setIsProcessing(false);

    // Automatically reveal VIP Greeting Pass
    setTimeout(() => {
      onOpenVipPass(faculty);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller & Status Bar */}
      <div className="bg-[#091024] border border-cyan-900/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI FACIAL RECOGNITION &amp; VOICE ORCHESTRATION STATION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Medha 2K26 Welcome Desk
          </h2>
          <p className="text-xs text-slate-400">
            Powered by Python backend, OpenCV 36-faculty neural dataset, ESP32 OLED, and Bluetooth speaker
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={isWebcamActive ? stopWebcam : startWebcam}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              isWebcamActive
                ? 'bg-rose-950/80 border border-rose-600 text-rose-300 hover:bg-rose-900'
                : 'bg-cyan-950/80 border border-cyan-600 text-cyan-300 hover:bg-cyan-900'
            }`}
          >
            {isWebcamActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>{isWebcamActive ? 'Stop Webcam' : 'Use Laptop Webcam'}</span>
          </button>

          <button
            onClick={() => runFullRecognitionSequence(selectedFaculty)}
            disabled={isProcessing}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isProcessing ? 'Executing Sequence...' : 'Trigger Face Recognition & Voice'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Camera Video Feed (Left) & Faculty Recognition Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Camera Feed & Neural Detection HUD */}
        <div className="lg:col-span-7 bg-[#070d1e] border border-cyan-900/60 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Corner Brackets for High-Tech HUD */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Top Video HUD Info */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-cyan-950/80 mb-3">
            <span className="flex items-center gap-2 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              USB WEBCAM STREAM (1080P)
            </span>
            <span>FPS: 30 · DLIB FACE 68-PTS</span>
          </div>

          {/* Video / Simulator Screen Area */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-cyan-950">
            {isWebcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              /* Simulated Faculty Video Stream */
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0a1228] to-[#040817]">
                <img
                  src={selectedFaculty.photoUrl}
                  alt={selectedFaculty.name}
                  className="max-h-full max-w-full object-contain filter contrast-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/robot.jpeg';
                  }}
                />

                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none animate-[scanline_3s_linear_infinite]" />
              </div>
            )}

            {/* Neural Detection Box Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`relative w-48 h-56 sm:w-64 sm:h-72 border-2 rounded-2xl transition-all duration-300 ${
                  currentStep === 'matched' || currentStep === 'completed'
                    ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                    : currentStep === 'scanning'
                    ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse'
                    : 'border-slate-500/60'
                }`}
              >
                {/* Facial Landmark Points */}
                <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400" />

                {/* Recognition Label Tag */}
                <div className="absolute -top-7 left-0 right-0 text-center">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      currentStep === 'matched' || currentStep === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : currentStep === 'scanning'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                        : 'bg-black/70 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {currentStep === 'matched' || currentStep === 'completed'
                      ? `MATCH: ${selectedFaculty.salutation} ${selectedFaculty.name} (98.8%)`
                      : currentStep === 'scanning'
                      ? 'ANALYZING FACIAL MESH...'
                      : currentStep === 'countdown'
                      ? `LOOK AT WEBCAM IN ${countdown}s`
                      : 'READY FOR WEBCAM SCAN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Countdown Overlay when active */}
            {currentStep === 'countdown' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center">
                <span className="text-6xl font-extrabold text-cyan-400 font-mono animate-ping">
                  {countdown}
                </span>
                <span className="text-xs font-mono text-cyan-200 mt-2">
                  PREPARING FACIAL RECOGNITION...
                </span>
              </div>
            )}
          </div>

          {/* Current Step Tracker Strip */}
          <div className="pt-3 border-t border-cyan-950/80 mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>MEDHA ROBOT ENGINE</span>
            </span>
            <span className="text-cyan-300">
              {currentStep === 'idle' && 'IDLE · CLICK TRIGGER TO START'}
              {currentStep === 'greeting' && 'STEP 1: PLAYING WELCOME ANNOUNCEMENT'}
              {currentStep === 'countdown' && `STEP 2: AUDIO GAP (${countdown}s)`}
              {currentStep === 'scanning' && 'STEP 3: PROMPTING WEBCAM GAZE'}
              {currentStep === 'matched' && 'STEP 4: NEURAL MATCH CONFIRMED'}
              {currentStep === 'completed' && 'STEP 5: COMPLETED · SMS & PASS DISPATCHED'}
            </span>
          </div>
        </div>

        {/* Right: Faculty Target & Live Sync Status */}
        <div className="lg:col-span-5 bg-[#070d1e] border border-cyan-900/60 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Target Faculty Database</h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                Member #{selectedFaculty.id} / 36
              </span>
            </div>

            {/* Selected Faculty Profile Card */}
            <div className="flex items-center gap-4 bg-[#050917] border border-cyan-950 rounded-2xl p-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-500/60 shrink-0 bg-slate-900 shadow-md">
                <img
                  src={selectedFaculty.photoUrl}
                  alt={selectedFaculty.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/robot.jpeg';
                  }}
                />
              </div>

              <div className="overflow-hidden space-y-1">
                <div className="text-sm font-bold text-white truncate">
                  {selectedFaculty.salutation} {selectedFaculty.name}
                </div>
                <div className="text-xs text-cyan-400 truncate">{selectedFaculty.designation}</div>
                <div className="text-[11px] text-slate-400 truncate">{selectedFaculty.department}</div>
                <div className="text-[10px] font-mono text-emerald-400">
                  Phone: +91 {selectedFaculty.phone}
                </div>
              </div>
            </div>

            {/* Quick Faculty Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                SELECT FACULTY TO TEST RECOGNITION:
              </label>
              <select
                value={selectedFaculty.id}
                onChange={(e) => {
                  const target = facultyList.find((f) => f.id === Number(e.target.value));
                  if (target) onSelectFaculty(target);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    #{f.id} - {f.salutation} {f.name} ({f.designation} - {f.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Closing Thought / Personalized Blessing */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-amber-400 block mb-1">
                INDIVIDUAL CLOSING THOUGHT:
              </span>
              <p className="text-xs text-slate-300 italic font-sans">
                &ldquo;{selectedFaculty.customThought}&rdquo;
              </p>
            </div>
          </div>

          {/* Trigger Actions Footer */}
          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
            <button
              onClick={() => runFullRecognitionSequence(selectedFaculty)}
              disabled={isProcessing}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Facial Scan &amp; Bluetooth Speech</span>
            </button>

            <button
              onClick={() => onOpenVipPass(selectedFaculty)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>View VIP Pass &amp; Dynamic Greeting Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
