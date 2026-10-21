export interface FacultyMember {
  id: number;
  name: string;
  salutation: string;
  designation: string;
  department: string;
  phone: string;
  photoUrl: string;
  pageIndex: number;
  status: 'registered' | 'checked_in' | 'pending';
  registeredAt?: string;
  customThought: string;
  vipToken: string;
}

export interface HardwareState {
  esp32Connected: boolean;
  port: string;
  baudRate: number;
  greenLed: boolean;
  redLed: boolean;
  oledText: string[];
  bluetoothSpeaker: boolean;
  thermalPrinter: boolean;
  lastPrintJob?: {
    id: string;
    recipientName: string;
    timestamp: string;
    token: string;
  };
}

export interface EventLog {
  id: string;
  timestamp: string;
  category: 'FACE_RECOGNITION' | 'VOICE_COMMAND' | 'ESP32_HARDWARE' | 'SMS_DISPATCH' | 'PRINTER' | 'STUDENT_MEDIA' | 'SECURITY';
  message: string;
  details?: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface StudentMediaItem {
  id: string;
  title: string;
  uploaderName: string;
  department: string;
  mediaType: 'photo' | 'video';
  url: string;
  timestamp: string;
  likes: number;
  resolution: string;
  isStudentUpload?: boolean;
}

export interface SmsMessage {
  id: string;
  to: string;
  recipientName: string;
  text: string;
  vipLink: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'pending';
}
