'use client';

import { useCallback, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export default function InactivityHandler() {
  const { status } = useSession();
  const timer = useRef(null);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/auth/restricted-access");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    localStorage.setItem('lastActiveAt', Date.now().toString());

    timer.current = setTimeout(() => {
      console.log("User inactive. Logging out...");
      handleLogout();
    }, INACTIVITY_LIMIT);
  }, [handleLogout]);

  useEffect(() => {
    if (status === "authenticated") {
      // Ensure fresh timestamp after successful login
      localStorage.setItem("lastActiveAt", Date.now().toString());
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const now = Date.now();
    const lastActiveAtString = localStorage.getItem("lastActiveAt");

    // If no activity recorded before, just initialize it
    if (!lastActiveAtString) {
      localStorage.setItem("lastActiveAt", now.toString());
    } else {
      const lastActiveAt = parseInt(lastActiveAtString, 10);
      // If lastActiveAt is valid and too old, logout
      if (!isNaN(lastActiveAt) && now - lastActiveAt > INACTIVITY_LIMIT) {
        console.log("User inactive too long. Logging out.");
        handleLogout();
        return;
      }
    }

    resetTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status, handleLogout, resetTimer]);

  return null;
}