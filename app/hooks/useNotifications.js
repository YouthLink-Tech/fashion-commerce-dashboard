"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useAuth } from "../contexts/auth";

const useNotifications = () => {

  const axiosPublic = useAxiosPublic();
  const { existingUserData } = useAuth();
  const userEmail = existingUserData?.email;

  const { data: notificationList, isPending: isNotificationPending, refetch } = useQuery({
    queryKey: ["notificationList"],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosPublic.get(`/get-merged-notifications?email=${userEmail}`);
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