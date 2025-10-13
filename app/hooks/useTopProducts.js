"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useTopProducts = () => {
  const axiosSecure = useAxiosSecure();

  const { data: topProducts, isPending: isTopProductsPending, refetch } = useQuery({
    queryKey: ["topProductsList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/top-products");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching analytics top products details:', err);
    }
  });

  return [topProducts, isTopProductsPending, refetch];
};

export default useTopProducts;