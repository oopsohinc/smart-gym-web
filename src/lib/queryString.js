/**
 * buildQueryString — build URL query string từ một object params
 * Bỏ qua các key có giá trị undefined, null, hoặc string rỗng.
 *
 * @param {Record<string, any>} params
 * @returns {string}  VD: "page=1&limit=10&q=foo&status=active"
 */
export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}
