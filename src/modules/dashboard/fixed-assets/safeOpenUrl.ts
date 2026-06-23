const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

export function safeOpenUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    if (!SAFE_URL_SCHEMES.includes(parsed.protocol)) {
      return false;
    }
    window.open(parsed.toString(), "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}
