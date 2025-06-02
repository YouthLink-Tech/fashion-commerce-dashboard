"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSeasons = () => {
  const axiosPublic = useAxiosPublic();

  const { data: seasonList, isPending: isSeasonPending, refetch } = useQuery({
    queryKey: ["seasonList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allSeasons");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching seasons:', err);
    }
  });

  return [seasonList, isSeasonPending, refetch];
};

export default useSeasons;