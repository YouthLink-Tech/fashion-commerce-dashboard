"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const usePrivacyPolicy = () => {

  const axiosPublic = useAxiosPublic();

  const { data: privacyPolicyList, isPending: isPrivacyPolicyPending } = useQuery({
    queryKey: ["privacyPolicyList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-privacy-policies");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching privacy-policy`, err);
    }
  })

  return [privacyPolicyList, isPrivacyPolicyPending];
};

export default usePrivacyPolicy;