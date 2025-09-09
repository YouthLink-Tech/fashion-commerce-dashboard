"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useAnalyticsProfitability = () => {
  const axiosSecure = useAxiosSecure();

  const { data: analyticsProfitability, isPending: isAnalyticsProfitabilityPending, refetch } = useQuery({
    queryKey: ["analyticsProfitability"],
    queryFn: async () => {
      const res = await axiosSecure.get("/analytics/profitability");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching analytics profitability details:', err);
    }
  });

  return [analyticsProfitability, isAnalyticsProfitabilityPending, refetch];
};

export default useAnalyticsProfitability;