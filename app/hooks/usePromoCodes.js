"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePromoCodes = () => {
  const axiosPublic = useAxiosPublic();

  const { data: promoList, isPending: isPromoPending, refetch } = useQuery({
    queryKey: ["promoList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allPromoCodes");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching promos:', err);
    }
  });

  return [promoList, isPromoPending, refetch];
};

export default usePromoCodes;