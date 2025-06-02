"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useLoginRegisterSlides = () => {

  const axiosPublic = useAxiosPublic();

  const { data: loginRegisterImageList, isPending: isLoginRegisterImagePending, refetch } = useQuery({
    queryKey: ["loginRegisterImageList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allLoginRegisterImageUrls");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error(`Error fetching category:`, err);
    }
  })

  return [loginRegisterImageList, isLoginRegisterImagePending, refetch];
};

export default useLoginRegisterSlides;