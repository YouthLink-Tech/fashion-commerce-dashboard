"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useTopHeader = () => {

  const axiosPublic = useAxiosPublic();

  const { data: topHeaderList, isPending: isTopHeaderPending, refetch } = useQuery({
    queryKey: ["topHeaderList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/get-all-header-collection");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching top header`, err);
    }
  })

  return [topHeaderList, isTopHeaderPending, refetch];
};

export default useTopHeader;