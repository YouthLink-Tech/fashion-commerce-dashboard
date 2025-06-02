"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useOurStory = () => {

  const axiosPublic = useAxiosPublic();

  const { data: ourStoryList, isPending: isOurStoryPending, refetch } = useQuery({
    queryKey: ["ourStoryList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/get-all-story-collection-backend");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching our story`, err);
    }
  })

  return [ourStoryList, isOurStoryPending, refetch];
};

export default useOurStory;