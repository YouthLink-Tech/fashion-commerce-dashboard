"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useShippingPolicy = () => {

  const axiosPublic = useAxiosPublic();

  const { data: shippingPolicyList, isPending: isShippingPolicyPending } = useQuery({
    queryKey: ["shippingPolicyList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-shipping-policies");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching shipping policy`, err);
    }
  })

  return [shippingPolicyList, isShippingPolicyPending];
};

export default useShippingPolicy;