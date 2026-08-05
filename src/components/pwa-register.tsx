"use client";

import { useEffect } from "react";

/** Registers the service worker that gives the site its offline behaviour. */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is progressive enhancement — never block the app */
      });
    }
  }, []);
  return null;
}
