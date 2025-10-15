"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const usePurchaseOrders = () => {
  const axiosSecure = useAxiosSecure();

  const { data: purchaseOrderList, isPending: isPurchaseOrderPending, refetch } = useQuery({
    queryKey: ["purchaseOrderList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/purchase-order/all");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching purchase orders:', err);
    }
  });

  return [purchaseOrderList, isPurchaseOrderPending, refetch];
};

export default usePurchaseOrders;