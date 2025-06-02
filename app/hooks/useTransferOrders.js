"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useTransferOrders = () => {
  const axiosPublic = useAxiosPublic();

  const { data: transferOrderList, isPending: isTransferOrderPending, refetch } = useQuery({
    queryKey: ["transferOrderList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allTransferOrders");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching purchase orders:', err);
    }
  });

  return [transferOrderList, isTransferOrderPending, refetch];
};

export default useTransferOrders;