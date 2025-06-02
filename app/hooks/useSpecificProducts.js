"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSpecificProducts = () => {

  const axiosPublic = useAxiosPublic();

  const { data: specificProductList, isPending: isSpecificProductPending, refetch: refetchSpecificProducts } = useQuery({
    queryKey: ["specificProductList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allSpecificProducts");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching product details:`, err);
    }
  })

  return [specificProductList, isSpecificProductPending, refetchSpecificProducts];
};

export default useSpecificProducts;