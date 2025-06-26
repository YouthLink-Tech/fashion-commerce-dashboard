"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SessionWatcher() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Session has expired or been cleared manually

      (async () => {
        try {
          // await axios.post("http://localhost:5000/logout", null, {
          //   withCredentials: true,
          // });
          await axios.post("https://fc-backend-664306765395.asia-south1.run.app/logout", null, {
            withCredentials: true,
          });
        } catch (err) {
          console.error("Failed to clear backend refresh token", err);
        }

        await signOut({ redirect: false });
        router.replace("/auth/restricted-access");
      })();
    }
  }, [status, router]);

  return null;
}
