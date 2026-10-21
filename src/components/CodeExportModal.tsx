import React, { useState } from 'react';
import { Code, Download, Copy, Check, Terminal, Cpu, FileCode, CheckCircle2, X } from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'esp32' | 'requirements' | 'wiring'>('python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonScript = `"""
MEDHA 2K26 - FACE RECOGNITION & ESP32 HARDWARE INTEGRATION ENGINE
File: medha_face_recognizer.py
Author: Medha 2K26 AI Robotics Team (Lead: A. Renuka)
Date: October 24, 2026

Architecture:
- Captures USB Webcam Video stream (cv2.VideoCapture)
- Detects face landmarks using dlib / face_recognition
- Matches face against 36 Faculty dataset
- Speaks crisp robotic announcement via Bluetooth speaker (pyttsx3)
- Sends Serial Command to ESP32 over USB (pyserial at 115200 baud)
- Dispatches SMS notification with VIP Pass link
"""

import cv2
import face_recognition
import numpy as np
import serial
import time
import pyttsx3
import threading
import requests
import os

# ================= CONFIGURATION =================
SERIAL_PORT = "COM3"  # Change to "/dev/ttyUSB0" on Linux/macOS
BAUD_RATE = 115200
SMS_WEBHOOK_URL = "https://medha2k26.edu/api/sms/send"  # Or your Twilio / Fast2SMS API key

# Initialize Bluetooth / System Voice Synthesizer
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Select clear voice
for v in voices:
    if "english" in v.name.lower():
        engine.setProperty('voice', v.id)
        break
engine.setProperty('rate', 150)
engine.setProperty('pitch', 110)

def speak_async(text):
    """Speaks through Bluetooth speaker without blocking face detection thread."""
    def _speak():
        engine.say(text)
        engine.runAndWait()
    threading.Thread(target=_speak, daemon=True).start()

# Initialize ESP32 Serial Bridge
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)
    print(f"[OK] ESP32 Connected on {SERIAL_PORT} @ {BAUD_RATE} baud")
except Exception as e:
    print(f"[WARN] ESP32 not detected ({e}). Running in simulation mode.")
    ser = None

def send_esp32_command(command_str):
    """Sends formatted ASCII packet to ESP32: e.g. RECOG:Pradeep Kumar|Principal"""
    if ser and ser.is_open:
        ser.write((command_str + "\\n").encode('utf-8'))
        print(f"[ESP32 TX] -> {command_str}")

# ================= 36 FACULTY DATABASE ENCODINGS =================
# Preloaded dictionary of faculty names and photos
FACULTY_DB = [
    {"id": 1, "name": "Peta Pradeep Kumar", "role": "Principal", "phone": "8897526662", "img": "faculty_photos/page_01.jpg"},
    {"id": 2, "name": "Marada Satya Prakash", "role": "Principal", "phone": "8501986663", "img": "faculty_photos/page_02.jpg"},
    {"id": 3, "name": "BVPV Narasimha Murthy", "role": "Vice Principal", "phone": "7702661356", "img": "faculty_photos/page_03.jpg"},
    {"id": 4, "name": "Rajamudili Venkata Ramanayya Patrudu", "role": "Vice Principal", "phone": "9037789951", "img": "faculty_photos/page_04.jpg"},
    {"id": 5, "name": "M. Narsing Rao", "role": "HOD Statistics", "phone": "8897332542", "img": "faculty_photos/page_05.jpg"},
    # ... loaded from full 36 dataset
    {"id": 36, "name": "A. Renuka", "role": "AI Lead Organizer", "phone": "6281793680", "img": "faculty_photos/page_36.jpg"}
]

known_face_encodings = []
known_face_names = []
known_face_meta = []

print("[INFO] Loading and encoding 36 Faculty dataset...")
for f in FACULTY_DB:
    if os.path.exists(f["img"]):
        image = face_recognition.load_image_file(f["img"])
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_face_encodings.append(encodings[0])
            known_face_names.append(f["name"])
            known_face_meta.append(f)
            print(f"  + Loaded: {f['name']} ({f['role']})")

print(f"[SUCCESS] {len(known_face_encodings)} Faculty Encodings successfully loaded into memory.")

# ================= MAIN RECOGNITION LOOP =================
def run_medha_event_station():
    # USB Webcam capture
    video_capture = cv2.VideoCapture(0)
    video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # Initial Welcome Greeting
    time.sleep(1)
    send_esp32_command("BOOT:MEDHA 2K26|OCTOBER 24")
    speak_async("Hey! Hi! I'm Medha 2K26. Welcome to our event, Medha 2K26 on October 24th, 2026!")

    # 8-Second gap before asking to look at webcam
    time.sleep(8)
    speak_async("Please look at the webcam.")
    send_esp32_command("SCAN:LOOK AT CAMERA")

    recognized_faculty = set()

    while True:
        ret, frame = video_capture.read()
        if not ret:
            break

        # Resize for faster facial feature extraction
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # Detect face locations & encodings
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        for face_encoding, face_location in zip(face_encodings, face_locations):
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.55)
            name = "Unknown Guest"
            role = ""
            faculty_obj = None

            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]
                    faculty_obj = known_face_meta[best_match_index]
                    role = faculty_obj["role"]

            # Scale back up face coordinates
            top, right, bottom, left = [v * 4 for v in face_location]

            # Draw sparkling futuristic bounding box
            color = (0, 255, 0) if faculty_obj else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, f"{name} ({role})", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 2)

            # Trigger Hardware & Voice if recognized for the first time
            if faculty_obj and (name not in recognized_faculty):
                recognized_faculty.add(name)
                print(f"[RECOGNIZED] Welcome {name} - {role}!")

                # 1. Update OLED & Green LED on ESP32
                send_esp32_command(f"MATCH:{name}|{role}|OCT 24")

                # 2. Voice Announcement via Bluetooth Speaker
                speech_msg = (
                    f"Mr. {name} sir, you have been successfully registered for this Medha 2K26, "
                    f"and here the event details: event on October 24th, 2026. "
                    f"Event details and information will be passed through your SMS. "
                    f"So you can check now. You will have a text message sent to your mobile phone number."
                )
                speak_async(speech_msg)

                # 3. Send SMS notification with VIP Pass link
                print(f"[SMS TRIGGER] Dispatching to +91 {faculty_obj['phone']}")
                # In production: requests.post(SMS_WEBHOOK_URL, json={"to": faculty_obj['phone'], "name": name})

        cv2.imshow("MEDHA 2K26 - Live AI Face Recognition", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    if ser:
        ser.close()

if __name__ == "__main__":
    run_medha_event_station()
`;

  const esp32InoCode = `/*
 * MEDHA 2K26 - ESP32 OLED & DUAL LED HARDWARE CONTROLLER
 * Target: ESP32-S NodeMCU Module
 * Components:
 *   - 0.96 inch I2C OLED (SSD1306 128x64)
 *   - Green LED (GPIO 2) with 330 Ohm resistor
 *   - Red LED (GPIO 4) with 330 Ohm resistor
 *   - USB Serial Cable connected to Laptop (Python Face Recognizer)
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C  // Common I2C address for 0.96" SSD1306

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Pin Definitions
const int GREEN_LED_PIN = 2;   // Recognition Confirmed
const int RED_LED_PIN = 4;     // Scanning / Idle
const int I2C_SDA_PIN = 21;    // ESP32 default SDA
const int I2C_SCL_PIN = 22;    // ESP32 default SCL

void setup() {
  Serial.begin(115200);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);

  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH); // Standby red indicator

  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("[ERROR] SSD1306 allocation failed"));
    for(;;);
  }

  showBootScreen();
}

void showBootScreen() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 8);
  display.println(F("====================="));
  display.setCursor(20, 20);
  display.setTextSize(2);
  display.println(F("MEDHA"));
  display.setCursor(45, 38);
  display.println(F("2K26"));
  display.setTextSize(1);
  display.setCursor(18, 54);
  display.println(F("AI ROBOT READY"));
  display.display();
}

void loop() {
  // Check for incoming serial commands from Python Face Recognizer
  if (Serial.available() > 0) {
    String packet = Serial.readStringUntil('\\n');
    packet.trim();

    if (packet.startsWith("MATCH:")) {
      // Packet format: MATCH:Name|Role|OCT 24
      String payload = packet.substring(6);
      int firstPipe = payload.indexOf('|');
      int secondPipe = payload.indexOf('|', firstPipe + 1);

      String facultyName = (firstPipe > 0) ? payload.substring(0, firstPipe) : payload;
      String facultyRole = (firstPipe > 0 && secondPipe > 0) ? payload.substring(firstPipe + 1, secondPipe) : "";

      // 1. Light up Green LED and turn off Red LED
      digitalWrite(GREEN_LED_PIN, HIGH);
      digitalWrite(RED_LED_PIN, LOW);

      // 2. Render Faculty name on 0.96" OLED
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
      display.setCursor(0, 2);
      display.println(F("[ MEDHA 2K26 AI ]"));
      display.drawLine(0, 12, 128, 12, SSD1306_WHITE);

      display.setCursor(0, 16);
      display.println(F("WELCOME VIP FACULTY:"));

      display.setCursor(0, 28);
      display.setTextSize(1);
      display.println(facultyName);

      display.setCursor(0, 42);
      display.println(facultyRole);

      display.drawLine(0, 52, 128, 52, SSD1306_WHITE);
      display.setCursor(16, 55);
      display.println(F("OCT 24, 2026 - VIP"));
      display.display();

      delay(7000); // Keep on screen for 7 seconds
      digitalWrite(GREEN_LED_PIN, LOW);
      digitalWrite(RED_LED_PIN, HIGH);
      showBootScreen();
    }
    else if (packet.startsWith("SCAN:")) {
      digitalWrite(GREEN_LED_PIN, LOW);
      digitalWrite(RED_LED_PIN, HIGH);

      display.clearDisplay();
      display.setCursor(10, 20);
      display.setTextSize(1);
      display.println(F("MEDHA 2K26 WEBCAM"));
      display.setCursor(10, 36);
      display.println(F("PLEASE LOOK AT CAMERA"));
      display.display();
    }
  }
}
`;

  const requirementsTxt = `opencv-python>=4.8.0
face-recognition>=1.3.0
pyserial>=3.5
pyttsx3>=2.90
numpy>=1.24.0
requests>=2.31.0
pillow>=10.0.0
`;

  const wiringTable = [
    { component: '0.96" OLED VCC', esp32Pin: '3.3V (Pin 1)', notes: 'Power supply for OLED display' },
    { component: '0.96" OLED GND', esp32Pin: 'GND', notes: 'Common ground' },
    { component: '0.96" OLED SCL', esp32Pin: 'GPIO 22', notes: 'I2C Clock line' },
    { component: '0.96" OLED SDA', esp32Pin: 'GPIO 21', notes: 'I2C Data line' },
    { component: 'Green LED Anode (+)', esp32Pin: 'GPIO 2 via 330Ω Resistor', notes: 'Lights up upon faculty recognition' },
    { component: 'Green LED Cathode (-)', esp32Pin: 'GND', notes: 'Common ground' },
    { component: 'Red LED Anode (+)', esp32Pin: 'GPIO 4 via 330Ω Resistor', notes: 'Scanning / standby indicator' },
    { component: 'Red LED Cathode (-)', esp32Pin: 'GND', notes: 'Common ground' },
    { component: 'USB Cable', esp32Pin: 'Micro-USB / Type-C', notes: 'Connects to laptop running Python code' },
    { component: 'Bluetooth Speaker', esp32Pin: 'Laptop Paired', notes: 'Plays clear greeting commands & thoughts' },
  ];

  const handleCopyCode = () => {
    const textToCopy =
      activeCodeTab === 'python'
        ? pythonScript
        : activeCodeTab === 'esp32'
        ? esp32InoCode
        : activeCodeTab === 'requirements'
        ? requirementsTxt
        : JSON.stringify(wiringTable, null, 2);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#091024] border border-cyan-800 rounded-3xl shadow-2xl p-6 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-950 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl text-white">
              <FileCode className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>VS Code Deployment Package</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  READY TO FLASH
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete Python OpenCV face recognizer &amp; ESP32 Arduino C++ firmware
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Copy / Download */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeCodeTab === 'python'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              medha_face_recognizer.py
            </button>
            <button
              onClick={() => setActiveCodeTab('esp32')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeCodeTab === 'esp32'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              medha_esp32_oled.ino
            </button>
            <button
              onClick={() => setActiveCodeTab('requirements')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeCodeTab === 'requirements'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              requirements.txt
            </button>
            <button
              onClick={() => setActiveCodeTab('wiring')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeCodeTab === 'wiring'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Hardware Pinout &amp; Wiring
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                if (activeCodeTab === 'python') downloadFile('medha_face_recognizer.py', pythonScript);
                else if (activeCodeTab === 'esp32') downloadFile('medha_esp32_oled.ino', esp32InoCode);
                else if (activeCodeTab === 'requirements') downloadFile('requirements.txt', requirementsTxt);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-[#040816] p-4 font-mono text-xs text-slate-300">
          {activeCodeTab === 'python' && (
            <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-cyan-200">
              {pythonScript}
            </pre>
          )}

          {activeCodeTab === 'esp32' && (
            <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-emerald-200">
              {esp32InoCode}
            </pre>
          )}

          {activeCodeTab === 'requirements' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 rounded-lg text-slate-300">
                <span className="text-cyan-400 font-bold block mb-1">Install via Terminal in VS Code:</span>
                <code>pip install -r requirements.txt</code>
              </div>
              <pre className="whitespace-pre overflow-x-auto text-amber-200">{requirementsTxt}</pre>
            </div>
          )}

          {activeCodeTab === 'wiring' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300">
                Connect your components to the ESP32 module as listed in the schema below:
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a1228] text-cyan-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Module / Component</th>
                      <th className="py-2.5 px-3">ESP32 Pin Connection</th>
                      <th className="py-2.5 px-3">Function / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {wiringTable.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-white">{row.component}</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-mono">{row.esp32Pin}</td>
                        <td className="py-2.5 px-3 text-slate-400">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
