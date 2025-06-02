"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useUniqueColors = () => {

  const axiosPublic = useAxiosPublic();

  const { data: uniqueColorList, isPending: isUniqueColorPending, refetch } = useQuery({
    queryKey: ["uniqueColorList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allUniqueColors");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching sizes api`, err);
    }
  })

  return [uniqueColorList, isUniqueColorPending, refetch];
};

export default useUniqueColors;