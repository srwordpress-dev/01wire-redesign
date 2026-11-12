// File host. Uploads (POST /upload) go here, and the uploaded files are
// served back from `${API_BASE_URL}/public/<fileName>`.
export const API_BASE_URL = (process.env.REACT_APP_API_URL || "https://api.01wire.com").replace(
  /\/+$/,
  ""
);

// Order template download/upload must hit the same backend as GraphQL: the file
// host above is a different API that rejects this deployment's login token.
export const ORDER_API_BASE_URL = (
  process.env.REACT_APP_ORDER_API_URL ||
  (process.env.REACT_APP_GRAPHQL_SERVER_URL || "").replace(/\/graphql\/?$/, "") ||
  API_BASE_URL
).replace(/\/+$/, "");

// Builds a displayable URL for a stored image value: a bare file name
// ("123.png"), a legacy "public/123.png" or "/public/123.png" value, or an
// absolute URL (returned unchanged). Always resolves against the host the file
// was uploaded to, so previews and saved images point at the same place.
export const getImageUrl = (src?: string | null): string => {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  const fileName = src.replace(/^\/+/, "").replace(/^public\//, "");
  return `${API_BASE_URL}/public/${fileName}`;
};
