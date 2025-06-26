"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useExistingUsers = () => {
  const axiosSecure = useAxiosSecure();

  const { data: existingUsers, isPending: isExistingUsersPending, refetch } = useQuery({
    queryKey: ["existingUsers"],
    queryFn: async () => {
      const res = await axiosSecure.get("/all-existing-users");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching user details:', err);
    }
  });

  return [existingUsers, isExistingUsersPending, refetch];
};

export default useExistingUsers;