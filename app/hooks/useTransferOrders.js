"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useTransferOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: transferOrderList, isPending: isTransferOrderPending, refetch } = useQuery({
    queryKey: ["transferOrderList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/transfer-order/all");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching purchase orders:', err);
    }
  });

  return [transferOrderList, isTransferOrderPending, refetch];
};

export default useTransferOrders;