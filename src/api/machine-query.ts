import { useQuery } from "@tanstack/react-query";
import { usePrivateAxios } from "./axios";
import { Machine } from "@/types/locker";
import { Meta } from "@/types/order";

export interface MachineResponse {
  data: Machine[];
  meta: Meta;
}

export const useMachines = () => {
  const axios = usePrivateAxios();
  return useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const { data } = await axios.get<MachineResponse>(
        "/vending-machines/?populate[stocks][populate][product][populate]=price"
      );
      return data;
    },
  });
};
