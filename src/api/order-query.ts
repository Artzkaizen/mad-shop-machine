import { useQuery } from "@tanstack/react-query";
import { usePrivateAxios } from "./axios";
import { Meta, Order } from "@/types/order";

interface OrdersResponse {
  data: Order[];
  meta: Meta;
}

export const useOrders = () => {
  const axiosPrivate = usePrivateAxios();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get<OrdersResponse>("/orders");

      return data;
    },
  });
};
