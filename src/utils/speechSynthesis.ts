/**
 * Web Speech API Voice Synthesizer for Medha 2K26
 * Configured for crisp audio playback to laptop speakers or paired Bluetooth speaker
 */

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export function speakRobotVoice(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      options.onEnd?.();
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options.pitch ?? 1.15; // slightly higher tech pitch for Medha robot
    utterance.rate = options.rate ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Try to find a clear English or natural voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Zira')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      options.onError?.(e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function stopRobotVoice(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
