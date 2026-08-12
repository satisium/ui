export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://ui.satisium.com");

export const isDevelopment = process.env.NODE_ENV === "development";
