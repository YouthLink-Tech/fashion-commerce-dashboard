"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useSubCategories = () => {

  const axiosSecure = useAxiosSecure();

  const { data: subCategoryList, isPending: isSubCategoryPending, refetch } = useQuery({
    queryKey: ["subCategoryList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allSubCategories");
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