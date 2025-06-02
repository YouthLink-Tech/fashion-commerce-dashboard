"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useShipmentHandlers = () => {
  const axiosPublic = useAxiosPublic();

  const { data: shipmentHandlerList, isPending: isShipmentHandlerPending, refetch } = useQuery({
    queryKey: ["shipmentHandlerList"],
    queryFn: async () => {
      const res = await axiosPublic.get("/allShipmentHandlers");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching shipment handlers:', err);
    }
  });

  return [shipmentHandlerList, isShipmentHandlerPending, refetch];
};

export default useShipmentHandlers;