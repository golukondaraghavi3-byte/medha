/*
 * ======================================================================================
 * MEDHA 2K26 - ESP32 EMBEDDED OLED FIRMWARE & FACULTY REGISTRATION ENGINE
 * ======================================================================================
 * File: esp32_medha_oled_firmware.ino
 * Target Board: ESP32-S / ESP32 Dev Module
 * Display: 0.96 inch I2C OLED (SSD1306, 128x64 pixels, Address 0x3C)
 * Event: Medha 2K26 (October 24, 2026)
 * Project: AI Robot & 36 Faculty Facial Recognition Station
 * Lead Organizer: A. Renuka & Dept of Computer Science & AI
 * 
 * HARDWARE PIN CONNECTIONS:
 * --------------------------------------------------------------------------------------
 * ESP32 Pin        Component Pin          Description
 * --------------------------------------------------------------------------------------
 * 3.3V             OLED VCC               3.3V Power Supply
 * GND              OLED GND               Ground
 * GPIO 21 (SDA)    OLED SDA               I2C Serial Data
 * GPIO 22 (SCL)    OLED SCL               I2C Serial Clock
 * GPIO 2           Green LED Anode (+)    Success / Recognized (via 330 Ohm resistor)
 * GPIO 4           Red LED Anode (+)      Scanning / Standby (via 330 Ohm resistor)
 * GND              LEDs Cathode (-)       Common Ground for LEDs
 * Micro-USB        Laptop USB Port        Serial Communication @ 115200 Baud
 * ======================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Pin Definitions
const int GREEN_LED_PIN = 2;  // Green LED: Face match confirmed
const int RED_LED_PIN   = 4;  // Red LED: Standby / Scanning mode
const int I2C_SDA_PIN   = 21; // Default ESP32 SDA
const int I2C_SCL_PIN   = 22; // Default ESP32 SCL

// --------------------------------------------------------------------------------------
// DATA STRUCTURE: ALL 36 FACULTY & ORGANIZERS STORED DIRECTLY IN ESP32 MEMORY
// --------------------------------------------------------------------------------------
struct FacultyRecord {
  uint8_t id;
  const char* name;
  const char* designation;
  const char* department;
  const char* phone;
  const char* token;
};

const FacultyRecord FACULTY_DATABASE[36] = {
  { 1, "Peta Pradeep Kumar", "Principal", "Leadership", "8897526662", "VIP-001" },
  { 2, "Marada Satya Prakash", "Principal", "Academic", "8501986663", "VIP-002" },
  { 3, "BVPV Narasimha Murthy", "Vice Principal", "Student Affairs", "7702661356", "VIP-003" },
  { 4, "R.V. Ramanayya Patrudu", "Vice Principal", "Development", "9037789951", "VIP-004" },
  { 5, "M. Narsing Rao", "HOD Statistics", "Statistics", "8897332542", "VIP-005" },
  { 6, "M. Nookaratnam", "Lecturer Maths", "Mathematics", "9553018581", "VIP-006" },
  { 7, "Palipini Srinu", "H.O.D CRT", "Training", "8096221949", "VIP-007" },
  { 8, "P. Devi Shankar", "Lecturer CRT", "Training", "6300270051", "VIP-008" },
  { 9, "Miryala Shiva Prasad", "Lecturer CRT", "Training", "8142357458", "VIP-009" },
  { 10, "Kanuru Durga", "Lecturer CRT", "Training", "9398419695", "VIP-010" },
  { 11, "Karri Goutham Babu", "Lecturer English", "Soft Skills", "8074558427", "VIP-011" },
  { 12, "G. Sesi Bhushan Rao", "Lecturer English", "Soft Skills", "9573823447", "VIP-012" },
  { 13, "M. Ganesh Kumar", "Lecturer English", "Soft Skills", "7013223022", "VIP-013" },
  { 14, "Annepu Sridhar", "Lecturer English", "Soft Skills", "7981060508", "VIP-014" },
  { 15, "G. Satish Kanth", "H.O.D Management", "Management", "8333824825", "VIP-015" },
  { 16, "Patnayakuni Swetha", "Lecturer Commerce", "Management", "9393214984", "VIP-016" },
  { 17, "K. Sruthi", "H.O.D Comp Sci", "Computer Science", "8639380293", "VIP-017" },
  { 18, "K. Bhavani", "Lecturer Comp Sci", "Computer Science", "9160392953", "VIP-018" },
  { 19, "D. Leelavathi", "Lecturer Comp Sci", "Computer Science", "6301052715", "VIP-019" },
  { 20, "Pallapu Vineela", "Lecturer Comp Sci", "Computer Science", "7032574838", "VIP-020" },
  { 21, "B. Pavani", "Lecturer Comp Sci", "Data Science", "8008197699", "VIP-021" },
  { 22, "B. Rajeswari", "Lecturer Comp Sci", "Computer Science", "9390893840", "VIP-022" },
  { 23, "M. Suneetha", "Lecturer Comp Sci", "Computer Science", "9010861937", "VIP-023" },
  { 24, "B. Pranathi", "Lecturer Comp Sci", "Computer Science", "9346568696", "VIP-024" },
  { 25, "S. Joshika", "Lecturer Comp Sci", "Computer Science", "8639949608", "VIP-025" },
  { 26, "P. Gayathri", "Lecturer Comp Sci", "Computer Science", "7995453899", "VIP-026" },
  { 27, "Saviti Tarun", "Lecturer AI & ML", "Artificial Intel", "9704995477", "VIP-027" },
  { 28, "M. Satya Suneetha", "H.O.D Chemistry", "Chemistry", "7382048778", "VIP-028" },
  { 29, "G. Naresh", "H.O.D Electronics", "IoT & Electronics", "8498886056", "VIP-029" },
  { 30, "B. Tirupati Rao", "H.O.D Telugu", "Telugu Dept", "9848198792", "VIP-030" },
  { 31, "K. Shiva Krishna", "Lecturer Telugu", "Telugu Dept", "9573248106", "VIP-031" },
  { 32, "S. Sujatha", "H.O.D Hindi", "Hindi Dept", "9948306191", "VIP-032" },
  { 33, "G. Durga Devi", "Librarian", "Library Science", "9030730355", "VIP-033" },
  { 34, "T. Sai Ratnam", "HOD of AI", "Artificial Intel", "9347905677", "VIP-034" },
  { 35, "G. Srivani", "HOD Comp Sci", "Computer Science", "9849004262", "VIP-035" },
  { 36, "A. Renuka", "Student AI Lead", "Comp Sci & AI", "6281793680", "VIP-036" }
};

// Real-Time Clock State (Tracks hours, minutes, seconds)
int currentHours = 10;
int currentMinutes = 30;
int currentSeconds = 0;
unsigned long lastClockTick = 0;

// Display mode states
enum DisplayMode { MODE_STANDBY, MODE_RECOGNIZED, MODE_SCANNING, MODE_AUTO_CYCLE };
DisplayMode currentMode = MODE_STANDBY;
int currentFacultyIndex = 0;
unsigned long recognitionDisplayUntil = 0;
unsigned long lastCycleSwitch = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH); // Standby red indicator ON

  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("[ERROR] SSD1306 OLED allocation failed. Check I2C wiring!"));
    for (;;);
  }

  display.clearDisplay();
  showSplashScreen();
  delay(2000);
  showStandbyScreen();
  Serial.println(F("[READY] ESP32 Medha 2K26 OLED initialized. All 36 Faculty loaded."));
}

void loop() {
  updateInternalClock();
  handleSerialCommands();

  // Handle temporary recognition screen timeout
  if (currentMode == MODE_RECOGNIZED && millis() > recognitionDisplayUntil) {
    currentMode = MODE_STANDBY;
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, HIGH);
    showStandbyScreen();
  }

  // Handle Auto Cycle Mode through all 36 faculty
  if (currentMode == MODE_AUTO_CYCLE) {
    if (millis() - lastCycleSwitch > 3500) {
      lastCycleSwitch = millis();
      currentFacultyIndex = (currentFacultyIndex + 1) % 36;
      renderFacultyOnOled(currentFacultyIndex);
    }
  }

  // Refresh standby screen clock every second
  if (currentMode == MODE_STANDBY && (millis() - lastClockTick < 50)) {
    showStandbyScreen();
  }
}

// --------------------------------------------------------------------------------------
// INTERNAL REAL-TIME CLOCK LOGIC
// --------------------------------------------------------------------------------------
void updateInternalClock() {
  if (millis() - lastClockTick >= 1000) {
    lastClockTick = millis();
    currentSeconds++;
    if (currentSeconds >= 60) {
      currentSeconds = 0;
      currentMinutes++;
      if (currentMinutes >= 60) {
        currentMinutes = 0;
        currentHours = (currentHours + 1) % 24;
      }
    }
  }
}

String getFormattedTime() {
  char timeBuf[12];
  snprintf(timeBuf, sizeof(timeBuf), "%02d:%02d:%02d", currentHours, currentMinutes, currentSeconds);
  return String(timeBuf);
}

// --------------------------------------------------------------------------------------
// SERIAL COMMAND PARSER
// Commands supported:
//   "FACULTY:1" to "FACULTY:36" -> Displays faculty record and fires Green LED
//   "TIME:10:45:00"            -> Synchronizes real-time clock from laptop
//   "SCAN:ON"                  -> Sets OLED to scanning mode, blinks Red LED
//   "CYCLE:ON"                 -> Automatically cycles through all 36 faculty
//   "STANDBY"                  -> Returns to standby clock screen
// --------------------------------------------------------------------------------------
void handleSerialCommands() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command.startsWith(F("FACULTY:"))) {
      int facultyId = command.substring(8).toInt();
      if (facultyId >= 1 && facultyId <= 36) {
        triggerRecognition(facultyId - 1);
      }
    } 
    else if (command.startsWith(F("TIME:"))) {
      // Format: TIME:HH:MM:SS
      String timeStr = command.substring(5);
      int h = timeStr.substring(0, 2).toInt();
      int m = timeStr.substring(3, 5).toInt();
      int s = timeStr.substring(6, 8).toInt();
      currentHours = h;
      currentMinutes = m;
      currentSeconds = s;
      Serial.print(F("[TIME SYNCED] -> "));
      Serial.println(getFormattedTime());
      if (currentMode == MODE_STANDBY) showStandbyScreen();
    }
    else if (command == F("SCAN:ON")) {
      currentMode = MODE_SCANNING;
      showScanningScreen();
    }
    else if (command == F("CYCLE:ON")) {
      currentMode = MODE_AUTO_CYCLE;
      currentFacultyIndex = 0;
      lastCycleSwitch = millis();
      renderFacultyOnOled(0);
      Serial.println(F("[CYCLE] Auto-cycling all 36 Faculty on OLED"));
    }
    else if (command == F("CYCLE:OFF") || command == F("STANDBY")) {
      currentMode = MODE_STANDBY;
      digitalWrite(GREEN_LED_PIN, LOW);
      digitalWrite(RED_LED_PIN, HIGH);
      showStandbyScreen();
    }
  }
}

// --------------------------------------------------------------------------------------
// OLED DISPLAY RENDERING ROUTINES
// --------------------------------------------------------------------------------------
void triggerRecognition(int index) {
  currentMode = MODE_RECOGNIZED;
  currentFacultyIndex = index;
  recognitionDisplayUntil = millis() + 8000; // Stay on screen for 8 seconds

  // Hardware LED triggers: Green ON, Red OFF
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);

  renderFacultyOnOled(index);

  // Send confirmation back to Laptop Serial
  Serial.print(F("[ESP32 OLED OK] Displayed #"));
  Serial.print(index + 1);
  Serial.print(F(" : "));
  Serial.print(FACULTY_DATABASE[index].name);
  Serial.print(F(" | Time: "));
  Serial.println(getFormattedTime());
}

void renderFacultyOnOled(int idx) {
  const FacultyRecord& f = FACULTY_DATABASE[idx];

  display.clearDisplay();
  display.setTextWrap(false);

  // Yellow Zone (Top 16 Pixels on standard dual-color 0.96" OLED)
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(F("MEDHA 2K26"));
  
  // Real-time Clock on right top
  display.setCursor(76, 0);
  display.print(getFormattedTime());

  // Horizontal divider line
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);

  // Cyan Zone (Bottom 48 Pixels)
  display.setCursor(0, 15);
  display.print(F("WELCOME VIP #"));
  display.print(f.id);
  display.print(F("/36"));

  // Faculty Name (Bold highlighted line)
  display.setCursor(0, 27);
  display.setTextSize(1);
  display.println(f.name);

  // Designation & Department
  display.setCursor(0, 39);
  display.println(f.designation);

  display.setCursor(0, 49);
  display.print(f.department);

  // Bottom Status Bar
  display.drawLine(0, 56, 127, 56, SSD1306_WHITE);
  display.setCursor(0, 57);
  display.print(f.token);
  display.setCursor(72, 57);
  display.print(F("OCT 24 VIP"));

  display.display();
}

void showStandbyScreen() {
  display.clearDisplay();
  display.setTextWrap(false);

  // Top Title Bar
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(F("MEDHA 2K26 AI"));

  // Real-time Clock
  display.setCursor(76, 0);
  display.print(getFormattedTime());

  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);

  // Center Animated Box
  display.drawRect(4, 16, 120, 34, SSD1306_WHITE);
  display.setCursor(14, 21);
  display.print(F("36 FACULTY DB"));
  display.setCursor(14, 31);
  display.print(F("EVENT: OCT 24, 2026"));
  display.setCursor(14, 40);
  display.print(F("STATUS: READY"));

  // Footer
  display.drawLine(0, 54, 127, 54, SSD1306_WHITE);
  display.setCursor(4, 56);
  display.print(F("AWAITING WEBCAM SCAN"));

  display.display();
}

void showScanningScreen() {
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH);

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(F("WEBCAM ACTIVE"));
  display.setCursor(76, 0);
  display.print(getFormattedTime());
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);

  display.setCursor(10, 24);
  display.println(F("PLEASE LOOK AT"));
  display.setCursor(24, 38);
  display.println(F("WEBCAM NOW"));

  display.drawLine(0, 54, 127, 54, SSD1306_WHITE);
  display.setCursor(8, 56);
  display.print(F("ANALYZING 36 FACES"));
  display.display();
}

void showSplashScreen() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(16, 8);
  display.println(F("MEDHA"));
  display.setCursor(38, 28);
  display.println(F("2K26"));
  display.setTextSize(1);
  display.setCursor(10, 50);
  display.println(F("AI ROBOT ENGINE"));
  display.display();
}
