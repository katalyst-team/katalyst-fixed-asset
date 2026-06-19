import axios from "axios";
import { getCookie } from "cookies-next";

export type GetRefreshTokenResponse = {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    access_token_expires_at: string;
    refresh_token_expires_at: string;
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    pagination: {
      count: number;
      start: number;
      total: number;
    };
    server_time: number;
    success: boolean;
  };
};

export const getRefreshTokenService = (): Promise<GetRefreshTokenResponse> => {
  const refreshToken = getCookie("refresh_token");

  return axios({
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/v1/accounts/refresh`,
  }).then((response) => response.data);
};
