"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useCategories = () => {

  const axiosPublic = useAxiosPublic();

  const { data: categoryList, isPending: isCategoryPending, refetch } = useQuery({
    queryKey: ["categoryList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allCategories");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching category:`, err);
    }
  })

  return [categoryList, isCategoryPending, refetch];
};

export default useCategories;