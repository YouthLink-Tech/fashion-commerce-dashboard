"use client";

import { signIn, useSession } from "next-auth/react";
import useAxiosPublic from "./useAxiosPublic";

export const useRefreshToken = () => {
  const { data: session, update } = useSession();
  const axiosPublic = useAxiosPublic();

  const refreshToken = async () => {
    const res = await axiosPublic.post(`/api/user-access/refresh-token-backend`, null, {
      withCredentials: true,
    });

    const newAccessToken = res.data.accessToken;
    if (newAccessToken && update) {
      // Update NextAuth session/JWT to persist the new token
      await update({
        user: {
          ...session?.user,
          accessToken: newAccessToken,
        },
      });
    } else if (session?.user) {
      // Fallback (if update fails)
      session.user.accessToken = newAccessToken;
    } else {
      // No session? Force sign-in
      signIn();
      throw new Error("No session available");
    }

    return newAccessToken; // Return for retry use
  };
  return refreshToken;
};