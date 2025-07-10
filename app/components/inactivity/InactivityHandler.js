'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/config";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 mins

export default function InactivityHandler() {
  const { status } = useSession();
  const router = useRouter();
  const timer = useRef(null);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false); // ✅ prevent false logout

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${BACKEND_URL}/logout`, null, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem("initialPage");
    // console.log("[AutoLogout] Logging out user now...");
    await signOut({ redirect: false });
    // console.log("[AutoLogout] Redirecting to /auth/restricted-access");
    router.push("/auth/restricted-access");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      // console.log("[AutoLogout] Existing timer cleared.");
    }

    const now = Date.now();
    localStorage.setItem("lastActiveAt", now.toString());
    // console.log(`[AutoLogout] Activity detected. Timer reset at ${new Date(now).toISOString()}`);

    timer.current = setTimeout(() => {
      // console.log(`[AutoLogout] No activity for ${INACTIVITY_LIMIT / 60000} minutes. Logging out.`);
      handleLogout();
    }, INACTIVITY_LIMIT);
  }, [handleLogout]);

  useEffect(() => {
    if (status !== "authenticated") {
      // console.log("[AutoLogout] Skipping setup — user not authenticated.");
      return;
    }

    const now = Date.now();
    const lastActiveRaw = localStorage.getItem("lastActiveAt");
    const lastActiveAt = lastActiveRaw ? parseInt(lastActiveRaw, 10) : 0;

    if (!lastActiveRaw || isNaN(lastActiveAt)) {
      // console.warn("[AutoLogout] No valid lastActiveAt found. Initializing...");
      localStorage.setItem("lastActiveAt", now.toString());
    } else {
      const elapsed = now - lastActiveAt;
      // console.log(`[AutoLogout] Time since last activity: ${(elapsed / 60000).toFixed(2)} min`);

      if (isInitialCheckDone && elapsed > INACTIVITY_LIMIT) {
        // console.warn("[AutoLogout] Triggering logout due to inactivity.");
        handleLogout();
        return;
      }
    }

    resetTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    // console.log("[AutoLogout] Activity listeners attached.");

    setIsInitialCheckDone(true); // ✅ First hydration completed

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timer.current) {
        clearTimeout(timer.current);
        // console.log("[AutoLogout] Cleanup: Timer cleared on unmount.");
      }
    };
  }, [status, handleLogout, resetTimer, isInitialCheckDone]);

  return null;
}