"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useSizeRanges = () => {

  const axiosSecure = useAxiosSecure();

  const { data: sizeRangeList, isPending: isSizeRangePending, refetch } = useQuery({
    queryKey: ["sizeRangeList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allSizeRanges");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching sizes api`, err);
    }
  })

  return [sizeRangeList, isSizeRangePending, refetch];
};

export default useSizeRanges;