"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useAnalyticsSales = () => {
  const axiosSecure = useAxiosSecure();

  const { data: analyticsSales, isPending: isAnalyticsSalesPending, refetch } = useQuery({
    queryKey: ["analyticsSales"],
    queryFn: async () => {
      const res = await axiosSecure.get("/analytics/sales");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching analytics sales details:', err);
    }
  });

  return [analyticsSales, isAnalyticsSalesPending, refetch];
};

export default useAnalyticsSales;