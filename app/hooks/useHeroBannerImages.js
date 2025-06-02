"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useHeroBannerImages = () => {
  const axiosPublic = useAxiosPublic();

  const {
    data: heroBannerImageList,
    isPending: isLoginRegisterHeroBannerImagePending,
    refetch,
  } = useQuery({
    queryKey: ["heroBannerImageList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allHeroBannerImageUrls");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching category:`, err);
    },
  });

  return [heroBannerImageList, isLoginRegisterHeroBannerImagePending, refetch];
};

export default useHeroBannerImages;
