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
    return (
      <p className="text-xs text-muted">
        Voice input not supported in this browser.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={isListening ? stopListening : startListening}
      className={`
        flex items-center gap-3 w-full px-5 py-4 rounded-xl border-2
        transition-all duration-200 cursor-pointer
        ${
          isListening
            ? "border-error bg-error/5 text-error animate-pulse"
            : "border-accent bg-accent/5 text-primary hover:bg-accent/10"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {/* Microphone icon */}
      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${isListening ? "bg-error text-white" : "bg-accent text-primary"}
        `}
      >
        <svg
          className="w-6 h-6"
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
      </div>
      <div className="text-left">
        <span className="font-bold text-base">
          {isListening ? "Tap to stop" : "Tap to talk"}
        </span>
        <p className="text-xs text-muted">
          {isListening
            ? "Listening... describe your job"
            : "Describe the work instead of typing"}
        </p>
      </div>
    </button>
  );
}
