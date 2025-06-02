"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSizeRanges = () => {

  const axiosPublic = useAxiosPublic();

  const { data: sizeRangeList, isPending: isSizeRangePending, refetch } = useQuery({
    queryKey: ["sizeRangeList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allSizeRanges");
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