"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePaymentMethods = () => {
  const axiosPublic = useAxiosPublic();

  const { data: paymentMethodList, isPending: isPaymentMethodPending, refetch } = useQuery({
    queryKey: ["paymentMethodList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allPaymentMethods");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching payment method:', err);
    }
  });

  return [paymentMethodList, isPaymentMethodPending, refetch];
};

export default usePaymentMethods;