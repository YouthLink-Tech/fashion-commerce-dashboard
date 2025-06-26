"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useTags = () => {

  const axiosSecure = useAxiosSecure();

  const { data: tagList, isPending: isTagPending, refetch } = useQuery({
    queryKey: ["tagList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/allTags");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching tags api`, err);
    }
  })

  return [tagList, isTagPending, refetch];
};

export default useTags;