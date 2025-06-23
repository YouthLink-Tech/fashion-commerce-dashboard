"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useShippingZones = () => {
  const axiosSecure = useAxiosSecure();

  const { data: shippingList, isPending: isShippingPending, refetch } = useQuery({
    queryKey: ["shippingList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allShippingZones");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching shipping zones:', err);
    }
  });

  return [shippingList, isShippingPending, refetch];
};

export default useShippingZones;