"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useAssignableUsers = () => {
  const axiosSecure = useAxiosSecure();

  const { data: assignableUsers, isPending: isAssignableUserPending, refetch } = useQuery({
    queryKey: ["assignableUsers"],
    queryFn: async () => {
      const res = await axiosSecure.get("/assignable-users");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching assignable user details:', err);
    }
  });

  return [assignableUsers, isAssignableUserPending, refetch];
};

export default useAssignableUsers;