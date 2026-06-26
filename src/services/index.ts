import axios, {
  AxiosError,
  type AxiosResponse,
  type RawAxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

import { clearAuthTokens, persistAuthTokens } from "@/lib/authTokens";

import { decodeToken } from "../lib/jwt";

// import toast from "react-hot-toast";
/**
 * Helper for axios which automatically returns the JSON.
 *
 * @param config Base request config for axios.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    page: number;
    total_pages: number;
    total_count?: number | null;
  };
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleLogout = () => {
  clearAuthTokens();
  window.location.href =
    process.env.NEXT_PUBLIC_BASE_URL_FE ?? "https://katalyst-fixed-asset.vercel.app/";
};

const refreshAuthToken = async (
  token: string,
  refreshToken: string | undefined,
) => {
  try {
    const refreshResponse = await axios({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
        "Refresh-Token": `${refreshToken}`,
      },
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/v1/accounts/refresh`,
    });

    const response = refreshResponse.data;
    persistAuthTokens(response.data.access_token, response.data.refresh_token);
    processQueue(null, response.data.access_token);
    return response.data.access_token;
  } catch (err) {
    processQueue(err, null);
    handleLogout();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

const getAuthHeaders = (
  token: string | undefined,
  refreshToken: string | undefined,
  customHeaders?: RawAxiosRequestHeaders,
) => ({
  Authorization: token ? `Bearer ${token}` : "",
  "Content-Type": "application/json; charset=utf-8",
  "Refresh-Token": refreshToken ? `${refreshToken}` : "",
  ...(customHeaders || {}),
});

export default async function fetcher({
  baseURL,
  url,
  data,
  method,
  headers,
  ...config
}: RawAxiosRequestConfig) {
  const token = getCookie("token") as string | undefined;
  const refreshToken = getCookie("refresh_token") as string | undefined;
  let currentToken = token;

  // Check if token is expired
  if (token) {
    const decodedToken = decodeToken(token);
    const isExpired =
      decodedToken?.exp && decodedToken.exp < Math.floor(Date.now() / 1000);

    if (isExpired) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          currentToken = await refreshAuthToken(token, refreshToken);
        } catch (err) {
          throw err;
        }
      } else {
        const newToken = await new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ reject, resolve });
        });

        if (!newToken) {
          throw new Error("Failed to refresh token");
        }

        currentToken = newToken;
      }
    }
  }

  try {
    const res: AxiosResponse = await axios({
      baseURL: baseURL ?? process.env.NEXT_PUBLIC_ENDPOINT_URL,
      data,
      headers: getAuthHeaders(
        currentToken,
        refreshToken,
        headers as RawAxiosRequestHeaders,
      ),
      method,
      url,
      ...config,
    });
    return res.data;
  } catch (e) {
    const error = e as AxiosError;

    if (
      [401, 409, 403].includes(error.response?.status || 0) &&
      url !== "/v1/accounts/login"
    ) {
      const originalRequest = {
        baseURL: baseURL ?? process.env.NEXT_PUBLIC_ENDPOINT_URL,
        data,
        method,
        url,
        ...config,
      };

      if (isRefreshing) {
        try {
          const newToken = await new Promise<string | null>(
            (resolve, reject) => {
              failedQueue.push({ reject, resolve });
            },
          );

          if (!newToken) throw new Error("Failed to refresh token");

          const freshRefreshToken = getCookie("refresh_token") as string | undefined;
          const response = await axios({
            ...originalRequest,
            headers: getAuthHeaders(
              newToken,
              freshRefreshToken,
              headers as RawAxiosRequestHeaders,
            ),
          });
          return response.data;
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;
      // Re-read cookies in case a pre-emptive refresh already updated them
      const freshToken = getCookie("token") as string | undefined;
      const freshRefreshToken = getCookie("refresh_token") as string | undefined;
      try {
        const newToken = await refreshAuthToken(freshToken || token || "", freshRefreshToken ?? refreshToken);
        const response = await axios({
          ...originalRequest,
          headers: getAuthHeaders(
            newToken,
            freshRefreshToken ?? refreshToken,
            headers as RawAxiosRequestHeaders,
          ),
        });
        return response.data;
      } catch (err) {
        return Promise.reject(err);
      }
    }

    if (!error.response) {
      toast.error("Network Error: Unable to reach the server. Please check your connection.");
    }
    console.error(error);
    throw error;
  }
}

export const toastError = (
  err: AxiosError | Error | { message?: string },
  customError?: string,
) => {
  const errorMessage =
    "ERROR : " +
    (customError ??
      (err instanceof AxiosError
        ? (err.response?.data?.metadata?.message ??
          err.response?.statusText ??
          err.message)
        : err instanceof Error
          ? err.message
          : (err.message ?? "Something Error")));

  toast.error(errorMessage);
};
