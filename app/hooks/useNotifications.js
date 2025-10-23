"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const useNotifications = () => {
  const axiosSecure = useAxiosSecure();
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  const { data: notificationList, isPending: isNotificationPending, refetch } = useQuery({
    queryKey: ["notificationList"],
    enabled: false,  // Manual trigger
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/notifications/merged-all?email=${userEmail}`);
      return res?.data;
    },
    refetchInterval: 1000 * 30,
    onError: (err) => {
      console.error("Notifications error:", err.response?.status, err.response?.data);  // Keep this for errors
    },
    retry: 1,
  });

  useEffect(() => {
    if (status === "authenticated" && !!userEmail) {
      const timer = setTimeout(() => refetch(), 100);
      return () => clearTimeout(timer);
    }
  }, [status, userEmail, refetch]);

  return [notificationList, isNotificationPending, refetch];
};

export default useNotifications;