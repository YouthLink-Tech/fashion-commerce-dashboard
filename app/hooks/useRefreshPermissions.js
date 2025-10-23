"use client";
import { useSession } from "next-auth/react";
import { useAxiosSecure } from "./useAxiosSecure";
import toast from "react-hot-toast";

export const useRefreshPermissions = () => {
  const { data: session, update, status } = useSession();
  const axiosSecure = useAxiosSecure();

  const refreshPermissions = async (showToast = true) => {
    if (status !== "authenticated" || !session?.user?.accessToken || !session?.user?._id) return false;

    try {
      // Fetch fresh from backend
      const res = await axiosSecure.post("/api/user-access/refresh-token-backend", null, {
        withCredentials: true,  // For refresh cookie
      });
      const newAccessToken = res.data.accessToken;

      if (!newAccessToken) {
        toast.error("No new token received");  // Guard empty response
      }

      // Update session with NEW accessToken (triggers callbacks to decode/embed)
      await update({
        user: { ...session.user, accessToken: newAccessToken },
      });

      if (showToast) toast.success("Permissions refreshed");
      return true;
    } catch (error) {
      console.error("Refresh failed:", error);
      if (error.response?.data?.error === "ACCOUNT_DELETED") {
        // Axios secure handles, but toast optional
        if (showToast) toast.error("Account deleted—logging out");
      } else if (showToast) {
        toast.error("Failed to refresh permissions");
      }
      return false;
    }
  };

  return { refreshPermissions };
};