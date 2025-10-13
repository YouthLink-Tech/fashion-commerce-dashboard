"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useAnalyticsLowStock = () => {
  const axiosSecure = useAxiosSecure();

  const { data: analyticsLowStock, isPending: isAnalyticsLowStockPending, refetch } = useQuery({
    queryKey: ["analyticsLowStock"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/low-stock");
      return res?.data?.lowStockProducts;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching analytics low stock details:', err);
    }
  });

  return [analyticsLowStock, isAnalyticsLowStockPending, refetch];
};

export default useAnalyticsLowStock;