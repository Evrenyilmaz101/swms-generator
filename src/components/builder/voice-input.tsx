"use client";

import { useState, useRef, useCallback } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setIsSupported(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-AU";

    recognition.onresult = (event: any) => {
      const results: any[] = Array.from(event.results);
      const transcript = results
        .map((result: any) => result[0].transcript)
        .join(" ");
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={isListening ? stopListening : startListening}
      className={`
        inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium
        transition-colors cursor-pointer border
        ${
          isListening
            ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
            : "bg-[#FAFAF9] border-[#E7E5E4] text-[#0C0A09] hover:bg-[#F5F5F4]"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
      {isListening ? "Stop" : "Voice"}
    </button>
  );
}
