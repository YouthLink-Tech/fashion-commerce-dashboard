"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/config";

export default function SessionWatcher() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Session has expired or been cleared manually

      (async () => {
        try {
          await axios.post(`${BACKEND_URL}/logout`, null, {
            withCredentials: true,
          });
        } catch (err) {
          console.error("Failed to clear backend refresh token", err);
        }
        localStorage.removeItem("initialPage");
        await signOut({ redirect: false });
        router.replace("/auth/restricted-access");
      })();
    }
  }, [status, router]);

  return null;
}
