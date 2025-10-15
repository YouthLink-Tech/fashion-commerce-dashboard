"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useColors = () => {

  const axiosSecure = useAxiosSecure();

  const { data: colorList, isPending: isColorPending, refetch } = useQuery({
    queryKey: ["colorList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/color/all");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error("Error fetching colors api", err);
    }
  })

  return [colorList, isColorPending, refetch];
};

export default useColors;