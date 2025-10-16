"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useCustomers = () => {
  const axiosSecure = useAxiosSecure();

  const { data: customerDetails, isPending: isCustomerPending, refetch } = useQuery({
    queryKey: ["customerDetails"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/customer/all");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching customer details:', err);
    }
  });

  return [customerDetails, isCustomerPending, refetch];
};

export default useCustomers;