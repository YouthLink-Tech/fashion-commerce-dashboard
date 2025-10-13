"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useExpenseCategories = () => {

  const axiosSecure = useAxiosSecure();

  const { data: expenseCategoryList, isPending: isExpenseCategoryPending, refetch } = useQuery({
    queryKey: ["expenseCategoryList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/expenses/category");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching expense category:`, err);
    }
  })

  return [expenseCategoryList, isExpenseCategoryPending, refetch];
};

export default useExpenseCategories;