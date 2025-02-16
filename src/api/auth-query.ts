import { useMutation } from "@tanstack/react-query";
import axios from "./axios";
import useAuthStore from "@/store/auth";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useRegister = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (body: {
      username: string;
      email: string;
      password: string;
    }) => {
      const { data } = await axios.post("/auth/register", body);
      return data;
    },
    onSuccess: (data) => {
      const { jwt, user } = data;
      login(jwt, user);
    },
    onError: (error) => {
      console.error(error);

      toast.error("An error occurred. Please try again.");
    },
  });
};
export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (body: { identifier: string; password: string }) => {
      const { data } = await axios.post("/auth/local", body);
      return data;
    },
    onSuccess: (data) => {
      const { jwt, user } = data;
      login(jwt, user);
    },
    onError: (error) => {
      let message = "An error occurred. Please try again.";
      if (error instanceof AxiosError) {
        message =
          // @ts-expect-error error is AxiosError
          (error as AxiosError).response?.data?.error?.message || message;
      }
      toast.error(message);
    },
  });
};
