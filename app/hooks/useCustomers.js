"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useCustomers = () => {
  const axiosPublic = useAxiosPublic();

  const { data: customerDetails, isPending: isCustomerPending, refetch } = useQuery({
    queryKey: ["customerDetails"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allCustomerDetails");
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