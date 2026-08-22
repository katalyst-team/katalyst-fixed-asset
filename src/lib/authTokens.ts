import type { SerializeOptions } from "cookie";
import { deleteCookie, setCookie } from "cookies-next";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export const PENDING_SIGNUP_TOKENS_KEY = "pending_signup_tokens";

export const AUTH_COOKIE_OPTIONS: SerializeOptions = {
  maxAge: THIRTY_DAYS_IN_SECONDS,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const persistCookie = (name: string, value: string) => {
  setCookie(name, value, AUTH_COOKIE_OPTIONS);
};

export const persistAuthTokens = (
  accessToken: string,
  refreshToken: string
) => {
  persistCookie("token", accessToken);
  persistCookie("refresh_token", refreshToken);

  if (typeof window !== "undefined") {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }
};

export const clearAuthTokens = () => {
  deleteCookie("token");
  deleteCookie("refresh_token");

  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
  }
};

export const syncCookiesFromStorage = () => {
  if (typeof window === "undefined") return;

  const storedToken = localStorage.getItem("token");
  const storedRefreshToken = localStorage.getItem("refresh_token");

  if (storedToken) {
    persistCookie("token", storedToken);
  }
  if (storedRefreshToken) {
    persistCookie("refresh_token", storedRefreshToken);
  }
};
