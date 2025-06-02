"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useNotifyMeNotifications = () => {

  const axiosPublic = useAxiosPublic();

  const { data: notifyMeNotificationList, isPending: isNotifyMeNotificationPending, refetch } = useQuery({
    queryKey: ["notifyMeNotificationList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/get-all-availability-notifications");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching category:`, err);
    }
  })

  return [notifyMeNotificationList, isNotifyMeNotificationPending, refetch];
};

export default useNotifyMeNotifications;