"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/config";

const RefreshAccessToken = () => {
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  // const redirectPath = searchParams.get("redirect") || (typeof window !== "undefined" && localStorage.getItem("initialPage")) || "/dashboard";

  // console.log(redirectPath, "redirectPath");

  // console.log(window.location.href); // Should show ?redirect=/your-path

  useEffect(() => {
    if (searchParams) {
      setReady(true); // wait until searchParams is hydrated
    }
  }, [searchParams]);

  useEffect(() => {
    if (!ready) return;

    const tryRefresh = async () => {
      try {
        const redirectPath = searchParams.get("redirect");
        if (!redirectPath) {
          console.warn("Missing redirect path. Avoiding refresh.");
          router.replace("/auth/restricted-access");
          return;
        }

        const res = await axios.post(`${BACKEND_URL}/api/user-access/refresh-token-backend`, null, {
          withCredentials: true,
        });

        // console.log("Access token updated:", res.data.accessToken);

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
  }, [ready, router, searchParams, update]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Refreshing session...
    </div>
  );
};

export default RefreshAccessToken;