"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useLogo = () => {
  const axiosPublic = useAxiosPublic();

  const { data: logoList, isPending: isLogoPending, refetch } = useQuery({
    queryKey: ["logoList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/logo/all");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching logo:', err);
    }
  });

  return [logoList, isLogoPending, refetch];
};

export default useLogo;