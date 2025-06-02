"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useTermsConditions = () => {

  const axiosPublic = useAxiosPublic();

  const { data: termsNConditionsList, isPending: isTermConditionsPending } = useQuery({
    queryKey: ["termsNConditionsList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-terms-conditions");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching terms & conditions`, err);
    }
  })

  return [termsNConditionsList, isTermConditionsPending];
};

export default useTermsConditions;