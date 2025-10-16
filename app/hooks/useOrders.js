"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: orderList, isPending: isOrderPending, refetch } = useQuery({
    queryKey: ["orderList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/order/all");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching orders:', err);
    }
  });

  return [orderList, isOrderPending, refetch];
};

export default useOrders;