"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useProductsInformation = () => {

  const axiosPublic = useAxiosPublic();

  const { data: productList, isPending: isProductPending, refetch } = useQuery({
    queryKey: ["productList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allProducts");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching product details:`, err);
    }
  })

  return [productList, isProductPending, refetch];
};

export default useProductsInformation;