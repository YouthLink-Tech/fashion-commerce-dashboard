"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useOurStory = () => {

  const axiosSecure = useAxiosSecure();

  const { data: ourStoryList, isPending: isOurStoryPending, refetch } = useQuery({
    queryKey: ["ourStoryList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/story/all-backend");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching our story`, err);
    }
  })

  return [ourStoryList, isOurStoryPending, refetch];
};

export default useOurStory;