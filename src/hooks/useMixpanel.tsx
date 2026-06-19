import mixpanel from "mixpanel-browser";

import { useUser } from "@/context/user-context";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN as string;

mixpanel.init(MIXPANEL_TOKEN, {
  debug: process.env.NEXT_PUBLIC_VERCEL_ENV === "staging",
  opt_out_tracking_by_default: true,
  persistence: "localStorage",
  track_pageview: true,
});

export const useMixpanel = () => {
  const { tokenPayload } = useUser();
  const trackEvent = (eventName: string, properties = {}) => {
    // Add UTM parameters to the properties object
    const utmParams = {
      utm_campaign: getQueryParam("utm_campaign"),
      utm_content: getQueryParam("utm_content"),
      utm_medium: getQueryParam("utm_medium"),
      utm_source: getQueryParam("utm_source"),
      utm_term: getQueryParam("utm_term"),
    };
    // Add advertising click IDs to the properties object
    const adClickIds = {
      dclid: getQueryParam("dclid"),
      fbclid: getQueryParam("fbclid"),
      gclid: getQueryParam("gclid"),
      ko_click_id: getQueryParam("ko_click_id"),
      li_fat_id: getQueryParam("li_fat_id"),
      msclkid: getQueryParam("msclkid"),
      ttclid: getQueryParam("ttclid"),
      twclid: getQueryParam("twclid"),
      wbraid: getQueryParam("wbraid"),
    };

    // If the user has logged in, send the distinct_id to the mixpanel
    if (tokenPayload?.account_id) {
      mixpanel.track(eventName, {
        distinct_id: String(tokenPayload?.account_id),
        ...properties,
        ...utmParams,
        ...adClickIds,
      });
    } else {
      mixpanel.track(eventName, {
        ...properties,
        ...utmParams,
        ...adClickIds,
      });
    }
  };

  // Helper function to get query parameters from the URL
  const getQueryParam = (param: string) => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get(param) || undefined;
    }
    return undefined;
  };

  return {
    trackEvent,
  };
};
