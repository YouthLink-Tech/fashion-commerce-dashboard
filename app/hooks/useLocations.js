"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useLocations = () => {
  const axiosPublic = useAxiosPublic();

  const { data: locationList, isPending: isLocationPending, refetch } = useQuery({
    queryKey: ["locationList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allLocations");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching locations:', err);
    }
  });

  return [locationList, isLocationPending, refetch];
};

export default useLocations;