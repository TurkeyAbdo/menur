/**
 * Pick the correct error message from an API response based on locale.
 * API responses include both `error` (English) and `errorAr` (Arabic).
 */
export function apiMsg(
  data: { error?: string; errorAr?: string; message?: string; messageAr?: string },
  locale: string,
  fallback = ""
): string {
  if (locale === "ar") {
    return data.errorAr || data.messageAr || data.error || data.message || fallback;
  }
  return data.error || data.message || fallback;
}
