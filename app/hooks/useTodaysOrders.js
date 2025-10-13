"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useTodaysOrders = () => {

  const axiosSecure = useAxiosSecure();

  const { data: todaysOrders, isPending: isTodaysOrdersPending } = useQuery({
    queryKey: ["todaysOrders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/get-today-orders");
      return res?.data;
    },
    onError: (err) => {
      console.error(`Error fetching todays order details`, err);
    }
  })

  return [todaysOrders, isTodaysOrdersPending];
};

export default useTodaysOrders;