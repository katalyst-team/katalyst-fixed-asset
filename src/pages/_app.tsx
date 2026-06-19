import "@/styles/globals.css";

import { QueryClientProvider } from "@tanstack/react-query";
import mixpanel from "mixpanel-browser";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";

import { DensityProvider } from "@/components/shared/DensitySwitcher";
import { Toaster } from "@/components/ui/sonner";
import { UserPreferencesProvider } from "@/context/user-preferences-context";
import { getQueryClient } from "@/lib/query-client";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN as string;

if (typeof window !== "undefined") {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: true,
    opt_out_tracking_by_default: false,
    persistence: "localStorage",
    track_pageview: true,
  });
  mixpanel.opt_in_tracking();
}

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider
      disableTransitionOnChange
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
    >
      <QueryClientProvider client={getQueryClient()}>
        <UserPreferencesProvider>
          <DensityProvider>
            <Component {...pageProps} />
            <Toaster />
          </DensityProvider>
        </UserPreferencesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default appWithTranslation(App);
