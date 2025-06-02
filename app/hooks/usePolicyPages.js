"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePolicyPages = () => {
  const axiosPublic = useAxiosPublic();

  const { data: policyPagesList, isPending: isPolicyPagesPending, refetch } = useQuery({
    queryKey: ["policyPagesList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/get-all-policy-pdfs");
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching policy pages:', err);
    }
  });

  return [policyPagesList, isPolicyPagesPending, refetch];
};

export default usePolicyPages;