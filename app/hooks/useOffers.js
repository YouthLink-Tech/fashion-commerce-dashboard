"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useOffers = () => {

  const axiosSecure = useAxiosSecure();

  const { data: offerList, isPending: isOfferPending, refetch } = useQuery({
    queryKey: ["offerList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allOffers");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching promos:', err);
    }
  });

  return [offerList, isOfferPending, refetch];
};

export default useOffers;