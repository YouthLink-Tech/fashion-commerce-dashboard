"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useCustomerSupport = () => {
  const axiosSecure = useAxiosSecure();

  const { data: existingCustomerSupport, isPending: isCustomerSupportPending, refetch } = useQuery({
    queryKey: ["allCustomerSupportInformation's"],
    queryFn: async () => {
      const res = await axiosSecure.get("/all-customer-support-information");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching user details:', err);
    }
  });

  return [existingCustomerSupport, isCustomerSupportPending, refetch];
};

export default useCustomerSupport;