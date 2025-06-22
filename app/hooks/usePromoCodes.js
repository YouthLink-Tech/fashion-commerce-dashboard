"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const usePromoCodes = () => {
  const axiosSecure = useAxiosSecure();

  const { data: promoList, isPending: isPromoPending, refetch } = useQuery({
    queryKey: ["promoList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allPromoCodes");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching promos:', err);
    }
  });

  return [promoList, isPromoPending, refetch];
};

export default usePromoCodes;