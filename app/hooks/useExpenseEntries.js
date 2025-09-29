"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useExpenseEntries = () => {

  const axiosSecure = useAxiosSecure();

  const { data: expenseEntryList, isPending: isExpenseEntryPending, refetch } = useQuery({
    queryKey: ["expenseEntryList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/all-expense-entries");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching expense entries:`, err);
    }
  })

  return [expenseEntryList, isExpenseEntryPending, refetch];
};

export default useExpenseEntries;