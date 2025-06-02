"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useShippingZones = () => {
  const axiosPublic = useAxiosPublic();

  const { data: shippingList, isPending: isShippingPending, refetch } = useQuery({
    queryKey: ["shippingList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allShippingZones");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching shipping zones:', err);
    }
  });

  return [shippingList, isShippingPending, refetch];
};

export default useShippingZones;