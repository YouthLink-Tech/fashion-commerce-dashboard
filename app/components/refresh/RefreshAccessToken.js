"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

const RefreshAccessToken = () => {
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  console.log(redirectPath, "redirectPath");

  // console.log(window.location.href); // Should show ?redirect=/your-path

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        // const res = await axios.post("http://localhost:5000/refresh-token", null, {
        //   withCredentials: true,
        // });
        const res = await axios.post("https://fc-backend-664306765395.asia-south1.run.app/refresh-token", null, {
          withCredentials: true,
        });

        console.log("Access token updated:", res.data.accessToken);

        if (res?.data?.accessToken) {
          // Step 1: Update session
          await update({ accessToken: res.data.accessToken });

          // Step 2: Set just-refreshed cookie from server
          await fetch("/api/confirm-refresh", { method: "POST" });

          setTimeout(() => {
            window.location.href = redirectPath; // ⛔ Avoid router.replace here
          }, 300);
        } else {
          throw new Error("No token returned");
        }
      } catch (err) {
        // ❌ Refresh token failed or missing → redirect manually
        console.error("Refresh failed:", err?.response?.data || err.message);
        router.replace("/auth/restricted-access");
      }
    };

    tryRefresh();
  }, [router, update, redirectPath]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Refreshing session...
    </div>
  );
};

export default RefreshAccessToken;