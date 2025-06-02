"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useTags = () => {

  const axiosPublic = useAxiosPublic();

  const { data: tagList, isPending: isTagPending, refetch } = useQuery({
    queryKey: ["tagList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allTags");
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