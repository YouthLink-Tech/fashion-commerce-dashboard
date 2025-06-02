"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePurchaseOrders = () => {
  const axiosPublic = useAxiosPublic();

  const { data: purchaseOrderList, isPending: isPurchaseOrderPending, refetch } = useQuery({
    queryKey: ["purchaseOrderList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allPurchaseOrders");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching purchase orders:', err);
    }
  });

  return [purchaseOrderList, isPurchaseOrderPending, refetch];
};

export default usePurchaseOrders;