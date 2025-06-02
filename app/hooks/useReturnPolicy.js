"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useReturnPolicy = () => {

  const axiosPublic = useAxiosPublic();

  const { data: returnPolicyList, isPending: isReturnPolicyPending } = useQuery({
    queryKey: ["returnPolicyList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-return-policies");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching return policy`, err);
    }
  })

  return [returnPolicyList, isReturnPolicyPending];
};

export default useReturnPolicy;