"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useOffers = () => {
  const axiosPublic = useAxiosPublic();

  const { data: offerList, isPending: isOfferPending, refetch } = useQuery({
    queryKey: ["offerList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allOffers");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching promos:', err);
    }
  });

  return [offerList, isOfferPending, refetch];
};

export default useOffers;