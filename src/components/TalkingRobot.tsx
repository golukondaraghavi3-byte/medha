import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Bot, Sparkles, RefreshCw, Send, Radio } from 'lucide-react';
import { speakRobotVoice, stopRobotVoice } from '../utils/speechSynthesis';

export const TalkingRobot: React.FC = () => {
  const [mode, setMode] = useState<'echo' | 'ai'>('ai');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'robot'; text: string }>>([
    {
      sender: 'robot',
      text: "Hello! I am Medha 2K26, your AI & Robotics companion. Welcome to our event on October 24th, 2026! You can talk to me, ask about our 34+ faculty, our data science face recognition system, or turn on Repeat Mode to make me mimic you like Talking Tom!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleUserSpeech(text);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
    }

    return () => {
      stopRobotVoice();
    };
  }, [mode]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleUserSpeech = (speechText: string) => {
    if (!speechText.trim()) return;

    // Add user message to history
    setChatHistory((prev) => [...prev, { sender: 'user', text: speechText }]);

    if (mode === 'echo') {
      // Talking Tom repeat mode with animated robotic tone
      const echoReply = `"${speechText}"! Haha, I repeated what you just said!`;
      setTimeout(() => {
        respondAsRobot(echoReply, 1.4); // higher pitch for Talking Tom effect
      }, 400);
    } else {
      // Intelligent Interactive AI Agent mode
      const reply = generateAiResponse(speechText);
      setTimeout(() => {
        respondAsRobot(reply, 1.1);
      }, 500);
    }
  };

  const generateAiResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('event') || q.includes('when') || q.includes('date')) {
      return 'Medha 2K26 is scheduled on October 24th, 2026! We feature cutting-edge robotics demonstrations, face recognition systems, and student project exhibits.';
    }
    if (q.includes('who are you') || q.includes('name')) {
      return "I am Medha 2K26, the intelligent robotic mascot powered by Python face recognition, OpenCV, and ESP32 hardware!";
    }
    if (q.includes('principal') || q.includes('pradeep')) {
      return 'Our respected Principal, Mr. Peta Pradeep Kumar sir, and Principal Mr. Marada Satya Prakash sir, lead our college with innovation and distinction.';
    }
    if (q.includes('renuka')) {
      return 'Renuka is our lead AI organizer who configured the Medha 2K26 faculty recognition system, ESP32 OLED integration, and the student photo hub!';
    }
    if (q.includes('faculty') || q.includes('teacher') || q.includes('hod')) {
      return 'We have 36 faculty and staff members in our secured database across AI, Computer Science, Statistics, Mathematics, CRT, Management, and Electronics!';
    }
    if (q.includes('photo') || q.includes('camera') || q.includes('picture')) {
      return 'Over 500 students are uploading more than 2,000 HD photos and videos to our Student Media Hub today. You can scan the QR code to upload your memories!';
    }
    if (q.includes('esp32') || q.includes('hardware') || q.includes('oled')) {
      return 'My hardware includes an ESP32 microcontroller with a 0.96 inch SSD1306 OLED display, dual status LEDs, resistors, and Bluetooth audio output.';
    }
    if (q.includes('printer') || q.includes('sms')) {
      return 'When recognized, faculty members receive an instant SMS with their VIP Pass link, and our mini Bluetooth thermal printer prints their entry token!';
    }

    return `Thank you for sharing that! At Medha 2K26 on October 24th, 2026, we are celebrating technology, data science, and robotics. Let me know how else I can assist!`;
  };

  const respondAsRobot = (replyText: string, pitch: number = 1.1) => {
    setChatHistory((prev) => [...prev, { sender: 'robot', text: replyText }]);
    setIsSpeaking(true);

    speakRobotVoice(replyText, {
      pitch,
      rate: 1.0,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    handleUserSpeech(text);
  };

  return (
    <div className="bg-[#091024] border border-cyan-900/50 rounded-2xl p-5 shadow-2xl">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-950/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>Speak to Medha Robot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                VOICE &amp; CHAT
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive voice assistant with Talking Tom repeat mode &amp; event knowledge
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => {
              setMode('ai');
              respondAsRobot("Switched to Intelligent Assistant Mode! You can now ask me anything about Medha 2K26.");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'ai'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ask Questions
          </button>
          <button
            onClick={() => {
              setMode('echo');
              respondAsRobot("Talking Tom Repeat Mode activated! Speak to me, and I will mimic everything you say!");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'echo'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Talking Tom Mimic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Animated Robot Mascot Stage */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div className="relative">
            {/* Glowing Aura */}
            <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 ${
              isSpeaking ? 'bg-cyan-500/30' : isListening ? 'bg-amber-500/30' : 'bg-blue-500/10'
            }`} />

            {/* Robot Image with Bounce */}
            <div className="relative w-56 h-56 rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] bg-slate-900">
              <img
                src="/robot.jpeg"
                alt="Medha 2K26 AI Robot"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isSpeaking ? 'scale-105 animate-robot-bounce' : 'animate-robot-bounce'
                }`}
              />

              {/* Status Badge */}
              <div className="absolute bottom-2 inset-x-2 py-1 px-2 rounded-lg bg-black/75 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking
                      ? 'bg-cyan-400 animate-ping'
                      : isListening
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="text-[10px] font-mono text-cyan-200 uppercase font-semibold">
                  {isSpeaking ? 'Speaking on Speaker...' : isListening ? 'Listening...' : 'Ready to Talk'}
                </span>
              </div>
            </div>
          </div>

          {/* Equalizer Visualizer Bars when speaking */}
          <div className="flex items-center gap-1.5 mt-4 h-6">
            {[40, 70, 95, 60, 85, 50, 90, 65, 45].map((height, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking ? 'bg-cyan-400' : 'bg-slate-800'
                }`}
                style={{
                  height: isSpeaking ? `${Math.max(15, Math.round(height * Math.random()))}px` : '4px',
                }}
              />
            ))}
          </div>

          {/* Preset Quick Questions */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3 max-w-sm">
            {[
              "Tell me about Medha 2K26",
              "Who is Principal Sir?",
              "Tell me about Renuka",
              "How does face recognition work?",
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleUserSpeech(prompt)}
                className="text-[10px] text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md px-2 py-1 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Live Conversation Stream & Voice Controls */}
        <div className="lg:col-span-7 flex flex-col h-[400px] justify-between bg-[#050917] border border-cyan-950 rounded-2xl p-4">
          {/* Conversation History */}
          <div className="overflow-y-auto space-y-3 pr-1 text-xs">
            {chatHistory.map((item, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${
                  item.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {item.sender === 'robot' && (
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-cyan-500/40 mt-0.5">
                    <img src="/robot.jpeg" alt="Robot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                    item.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="pt-3 border-t border-slate-800/80">
            <form onSubmit={handleManualSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={recognitionSupported ? 'Click to speak' : 'Microphone not supported on browser'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === 'echo'
                    ? 'Type something to hear the robot mimic you...'
                    : 'Ask Medha Robot a question...'
                }
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
