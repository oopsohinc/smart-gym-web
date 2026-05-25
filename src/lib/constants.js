/**
 * Storage keys — dùng tập trung để tránh magic strings rải rác
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

/**
 * Custom DOM events cho auth state sync
 */
export const AUTH_EVENTS = {
  CHANGED: "auth:changed",
};
