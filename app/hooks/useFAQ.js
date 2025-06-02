"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useFAQ = () => {

  const axiosPublic = useAxiosPublic();

  const { data: faqList, isPending: isFAQPending } = useQuery({
    queryKey: ["faqList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/all-faqs");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching FAQS`, err);
    }
  })

  return [faqList, isFAQPending];
};

export default useFAQ;