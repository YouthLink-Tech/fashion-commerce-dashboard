"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useLocations = () => {
  const axiosSecure = useAxiosSecure();

  const { data: locationList, isPending: isLocationPending, refetch } = useQuery({
    queryKey: ["locationList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/location/all");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching locations:', err);
    }
  });

  return [locationList, isLocationPending, refetch];
};

export default useLocations;