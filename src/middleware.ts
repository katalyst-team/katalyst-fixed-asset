import { deleteCookie } from "cookies-next";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_OPTIONS } from "./lib/authTokens";
import { encryptText } from "./lib/crypto";
import { decodeToken, type TokenPayload } from "./lib/jwt";

const decodeSafe = (value?: string): TokenPayload | null => {
  if (!value) return null;
  try {
    return decodeToken(value);
  } catch {
    return null;
  }
};

const persistResponseCookies = (
  response: NextResponse,
  token: string,
  refreshToken: string,
) => {
  response.cookies.set({
    ...AUTH_COOKIE_OPTIONS,
    name: "token",
    value: token,
  });
  response.cookies.set({
    ...AUTH_COOKIE_OPTIONS,
    name: "refresh_token",
    value: refreshToken,
  });
};

export async function middleware(request: NextRequest) {
  const AUTH_PATH_PAGE = [
    "/",
    "/sign-up",
    "/sign-up-verification",
    "/reset-password",
    "/reset-password-confirmation",
  ];

  const paramToken = request.nextUrl.searchParams.get("token");
  const paramRefreshToken = request.nextUrl.searchParams.get("refresh_token");

  const token = request.cookies.get("token");
  const refresh_token = request.cookies.get("refresh_token");
  const decodedToken = paramToken
    ? decodeToken(paramToken)
    : token?.value
      ? decodeToken(token?.value as string)
      : false;
  const isAuthenticated =
    (Boolean(token) || Boolean(paramToken)) &&
    (Boolean(paramRefreshToken) || Boolean(refresh_token));
  let locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
  if (request.nextUrl.locale === "default") {
    locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
  }

  if (isAuthenticated && request.nextUrl.pathname !== "/verification-access") {
    if (decodedToken) {
      const nowSec = Math.floor(Date.now() / 1000);
      const accessExpired = Boolean(decodedToken.exp) && decodedToken.exp < nowSec;
      const refreshDecoded = decodeSafe(
        refresh_token?.value ?? paramRefreshToken ?? undefined,
      );
      const refreshUsable = Boolean(refreshDecoded && refreshDecoded.exp > nowSec);
      if (accessExpired && !refreshUsable) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("token");
        response.cookies.delete("refresh_token");
        return response;
      }

      if (decodedToken.account_status === "PENDING") {
        deleteCookie("token");
        deleteCookie("refresh_token");
        const encryptedEmail = encryptText(decodedToken.email);
        const response = NextResponse.redirect(
          new URL(`/${locale}/sign-up/${encryptedEmail}`, request.url),
        );
        response.cookies.delete("token");
        response.cookies.delete("refresh_token");
        return response;
      }

      if (decodedToken.account_organization_role_status === "SUSPENDED") {
        deleteCookie("token");
        deleteCookie("refresh_token");
        const response = NextResponse.redirect(
          new URL(`/${locale}/verification-access`, request.url),
        );
        response.cookies.delete("token");
        response.cookies.delete("refresh_token");
        return response;
      }
    }

  }

  if (AUTH_PATH_PAGE.includes(request.nextUrl.pathname) && isAuthenticated) {
    if (paramToken && paramRefreshToken) {
      const response = NextResponse.redirect(
        new URL("/dashboard/fixed-assets/", request.url),
      );
      persistResponseCookies(response, paramToken, paramRefreshToken);

      return response;
    }

    return NextResponse.redirect(
      new URL(`/${locale}/dashboard/fixed-assets/`, request.url),
    );
  }
  if (request.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/`, request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard") && isAuthenticated) {
    if (paramToken && paramRefreshToken) {
      const response = NextResponse.redirect(
        new URL(`/${locale}/dashboard/fixed-assets/`, request.url),
      );
      persistResponseCookies(response, paramToken, paramRefreshToken);
      return response;
    }
    if (request.nextUrl.locale === "default") {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";

      return NextResponse.redirect(
        new URL(
          `/${locale}${request.nextUrl.pathname}${request.nextUrl.search}`,
          request.url,
        ),
      );
    }
  }
}
