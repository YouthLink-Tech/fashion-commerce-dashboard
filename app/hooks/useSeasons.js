"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useSeasons = () => {
  const axiosSecure = useAxiosSecure();

  const { data: seasonList, isPending: isSeasonPending, refetch } = useQuery({
    queryKey: ["seasonList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allSeasons");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching seasons:', err);
    }
  });

  return [seasonList, isSeasonPending, refetch];
};

export default useSeasons;