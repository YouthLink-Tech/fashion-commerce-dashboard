"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export default function InactivityHandler() {
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      console.log("User inactive. Logging out...");
      signOut({ callbackUrl: "/auth/restricted-access" });
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    resetTimer(); // Start the timer when mounted

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
};