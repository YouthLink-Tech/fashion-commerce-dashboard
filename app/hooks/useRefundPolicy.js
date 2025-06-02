"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useRefundPolicy = () => {

  const axiosPublic = useAxiosPublic();

  const { data: refundPolicyList, isPending: isRefundPolicyPending } = useQuery({
    queryKey: ["refundPolicyList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-refund-policies");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching refund policy`, err);
    }
  })

  return [refundPolicyList, isRefundPolicyPending];
};

export default useRefundPolicy;