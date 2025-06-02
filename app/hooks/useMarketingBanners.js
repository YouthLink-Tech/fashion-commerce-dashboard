"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useMarketingBanners = () => {

  const axiosPublic = useAxiosPublic();

  const { data: marketingBannerList, isPending: isMarketingBannerPending, refetch } = useQuery({
    queryKey: ["marketingBannerList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allMarketingBanners");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching category:`, err);
    }
  })

  return [marketingBannerList, isMarketingBannerPending, refetch];
};

export default useMarketingBanners;