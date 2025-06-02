"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSizes = () => {

  const axiosPublic = useAxiosPublic();

  const { data: sizeList, isPending: isSizePending, refetch } = useQuery({
    queryKey: ["sizeList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allSizes");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching sizes api`, err);
    }
  })

  return [sizeList, isSizePending, refetch];
};

export default useSizes;