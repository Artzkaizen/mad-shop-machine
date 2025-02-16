import type { Meta, Order } from "@/types/order";

import { useQuery } from "@tanstack/react-query";

import { usePrivateAxios } from "./axios";

interface OrdersResponse {
	data: Order[];
	meta: Meta;
}

export function useOrders() {
	const axiosPrivate = usePrivateAxios();
	return useQuery({
		queryKey: ["orders"],
		queryFn: async () => {
			const { data } = await axiosPrivate.get<OrdersResponse>("/orders");

			return data;
		}
	});
}
