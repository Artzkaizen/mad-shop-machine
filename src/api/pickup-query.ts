import { Meta, Product } from "@/types/order";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePrivateAxios } from "./axios";

interface OrderItem {
  id: number;
  quantity: number;
  product: Product | null;
}

interface Order {
  id: number;
  documentId: string;
  issue: boolean;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  items: OrderItem[];
}

export interface Pickup {
  id: number;
  documentId: string;
  progress: PickupStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  order: Order;
  items: {
    id: number;
    shipped: number;
    required: number;
    product: Product;
  }[];
}

interface PickupResponse {
  data: Pickup[];
  meta: Meta[];
}

export const usePickup = () => {
  const axios = usePrivateAxios();
  return useMutation({
    mutationKey: ["pickup"],
    mutationFn: async (pickupId: string) => {
      const { data } = await axios.get<{
        data: Pickup;
        meta: Meta[];
      }>(
        `/pickups/${pickupId}?populate=order.items.product&populate=items.product`
      );
      return data;
    },
  });
};

export const usePickups = () => {
  const axios = usePrivateAxios();
  return useQuery<PickupResponse>({
    queryKey: ["pickups"],
    queryFn: async () => {
      const { data } = await axios.get(
        "/pickups?populate=order.items&populate=order.items.product&populate=order.items.product.price"
      );
      return data;
    },
  });
};

type PickupStatus = "started" | "finished" | "pending";

export const useUpdatePickUpStatus = () => {
  const axios = usePrivateAxios();
  return useMutation({
    mutationKey: ["pickup, status"],
    mutationFn: async (body: {
      pickupId: string;
      progress: PickupStatus;
      items?: {
        product: string;
        required: number;
        shipped: number;
      }[];
    }) => {
      const newData = {
        data: {
          progress: body.progress,
          items: body?.items,
        },
      };

      const { data } = await axios.put(`/pickups/${body.pickupId}`, newData);
      return data;
    },
  });
};
