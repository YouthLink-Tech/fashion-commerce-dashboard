"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";
import { useSession } from "next-auth/react";

const useNotifications = () => {

  const axiosSecure = useAxiosSecure();
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  const { data: notificationList, isPending: isNotificationPending, refetch } = useQuery({
    queryKey: ["notificationList"],
    enabled: status === "authenticated" && !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/notifications/merged-all?email=${userEmail}`);
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching category:`, err);
    }
  })

  return [notificationList, isNotificationPending, refetch];
};

export default useNotifications;