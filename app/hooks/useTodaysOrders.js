"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useTodaysOrders = () => {

  const axiosPublic = useAxiosPublic();

  const { data: todaysOrders, isPending: isTodaysOrdersPending } = useQuery({
    queryKey: ["todaysOrders"],
    queryFn: async () => {
      const res = await axiosPublic.get("/get-todays-orders");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching todays order details`, err);
    }
  })

  return [todaysOrders, isTodaysOrdersPending];
};

export default useTodaysOrders;