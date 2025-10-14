"use client";
import { useQuery } from "@tanstack/react-query";
import { useAxiosSecure } from "./useAxiosSecure";

const useShipmentHandlers = () => {
  const axiosSecure = useAxiosSecure();

  const { data: shipmentHandlerList, isPending: isShipmentHandlerPending, refetch } = useQuery({
    queryKey: ["shipmentHandlerList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/shipment-handler/all");
      return res?.data;
    },
    onError: (err) => {
      console.error('Error fetching shipment handlers:', err);
    }
  });

  return [shipmentHandlerList, isShipmentHandlerPending, refetch];
};

export default useShipmentHandlers;