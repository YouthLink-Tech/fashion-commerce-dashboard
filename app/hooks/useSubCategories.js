"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSubCategories = () => {

  const axiosPublic = useAxiosPublic();

  const { data: subCategoryList, isPending: isSubCategoryPending, refetch } = useQuery({
    queryKey: ["subCategoryList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allSubCategories");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching sub-categories api`, err);
    }
  })

  return [subCategoryList, isSubCategoryPending, refetch];
};

export default useSubCategories;