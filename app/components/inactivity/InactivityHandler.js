'use client';

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in ms

export default function InactivityHandler() {
  const { status } = useSession();
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);

    // ✅ Always update activity time
    localStorage.setItem('lastActiveAt', Date.now().toString());

    timer.current = setTimeout(() => {
      console.log("User inactive. Logging out (via setTimeout).");
      signOut({ callbackUrl: '/auth/restricted-access' });
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // ✅ Wait until session is loaded
    if (status !== "authenticated") return;

    const now = Date.now();
    const lastActiveAt = parseInt(localStorage.getItem("lastActiveAt") || "0");

    // ✅ First-time visit, initialize lastActiveAt
    if (!lastActiveAt || isNaN(lastActiveAt)) {
      localStorage.setItem('lastActiveAt', now.toString());
    } else if (now - lastActiveAt > INACTIVITY_LIMIT) {
      console.log("User inactive on load (via localStorage). Logging out.");
      signOut({ callbackUrl: "/auth/restricted-access" });
      return;
    }

    resetTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status]);

  return null;
};