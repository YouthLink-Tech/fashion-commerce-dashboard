"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRefreshToken } from "./useRefreshToken";
import useAxiosPublic from "./useAxiosPublic";
import toast from "react-hot-toast";

// Shared promise to coordinate concurrent refreshes (module-level, persists across hooks)
let refreshingPromise = null;

export const useAxiosSecure = () => {
  const { data: session } = useSession();
  const axiosPublic = useAxiosPublic();
  const refreshToken = useRefreshToken();
  const isInterceptorAdded = useRef(false);

  // Dynamically update default Authorization header when session changes
  useEffect(() => {
    if (session?.user?.accessToken) {
      axiosPublic.defaults.headers.common.Authorization = `Bearer ${session.user.accessToken}`;
    } else {
      delete axiosPublic.defaults.headers.common.Authorization;
    }
  }, [session?.user?.accessToken, axiosPublic]);

  // Adding response interceptor ONLY ONCE (across all uses of this hook)
  useEffect(() => {
    if (isInterceptorAdded.current) return;

    isInterceptorAdded.current = true;

    const responseIntercept = axiosPublic.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        const responseData = error?.response?.data;

        // 🔹 Handle account deletion: Notify + Force logout
        if (error?.response?.status === 401 && responseData?.error === "ACCOUNT_DELETED") {
          // Showing notification as a toast
          toast.error(responseData.message || "Your account has been deleted by an administrator. Logging you out...", {
            duration: 4000,
            position: "top-center",
            style: { background: "#ef4444", color: "#fff" },  // Red theme for urgency
          });

          // Delay logout to let user read the message
          setTimeout(async () => {
            await signOut({
              callbackUrl: "/auth/restricted-access"  // Redirect to login
            });
          }, 2000);

          return Promise.reject(new Error(responseData.message || "Account deleted"));
        }

        // Regular 401 handling (token expiry refresh)
        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true; // Prevent infinite loop on retry

          // Coordinate: Start refresh only if not already in progress
          if (!refreshingPromise) {
            refreshingPromise = refreshToken().catch((err) => {
              refreshingPromise = null;
              throw err;
            });
          }

          // Wait for the shared refresh to complete
          try {
            const newToken = await refreshingPromise;
            // Update default header for all future requests (and this retry)
            axiosPublic.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            prevRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosPublic(prevRequest);
          } catch (refreshError) {
            refreshingPromise = null;
            // Refresh failed: Reject all (or sign out)
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup (eject on unmount, but since it's global, optional)
    return () => {
      axiosPublic.interceptors.response.eject(responseIntercept);
      isInterceptorAdded.current = false;
      refreshingPromise = null; // Reset if needed
    };
  }, [axiosPublic, refreshToken]); // Stable deps

  return axiosPublic;
};
