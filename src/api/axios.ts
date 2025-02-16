import useAuthStore from "@/store/auth";
import axios from "axios";
import { useEffect } from "react";

export default axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true,
});

export function usePrivateAxios() {
  // const refresh = useRefreshToken();
  const token = useAuthStore((state) => state.jwt);
  //   const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        const hasHeader = config.headers.Authorization;
        if (!hasHeader) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => {
        return response;
      },

      async (error) => {
        const prevRequest = error?.config;
        if (
          error?.response?.status === 403 ||
          (error?.response?.status === 401 && !prevRequest?.sent)
        ) {
          return Promise.reject(error);
          // prevRequest.sent = true;
          // const { access_token, refresh_token } = await refresh();
          // setTokens(jwt);
          // prevRequest.headers.Authorization
          //     = `Bearer ${access_token}`;
          // return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [token]);

  return axiosPrivate;
}
