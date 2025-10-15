"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useVendors = () => {

  const axiosSecure = useAxiosSecure();

  const { data: vendorList, isPending: isVendorPending, refetch } = useQuery({
    queryKey: ["vendorList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vendor/all");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching tags api`, err);
    }
  })

  return [vendorList, isVendorPending, refetch];
};

export default useVendors;