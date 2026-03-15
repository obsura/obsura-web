const getApiBaseUrl = () => {
  const rawUrl =
    (window as any)._env_?.VITE_API_BASE_URL ||
    (import.meta as any).env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api/v1";

  const cleanUrl = rawUrl.replace(/\/+$/, "");
  console.log("API_BASE_URL:", rawUrl, "->", cleanUrl);

  // Ensure we don't have a trailing slash which can cause 307 redirects and break CORS
  return cleanUrl;
};

const getApiOrigin = (apiBaseUrl: string) => {
  const rawOrigin =
    (window as any)._env_?.VITE_API_ORIGIN ||
    (import.meta as any).env.VITE_API_ORIGIN;

  if (rawOrigin && typeof rawOrigin === "string") {
    return rawOrigin.replace(/\/+$/, "");
  }

  try {
    const parsed = new URL(apiBaseUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return apiBaseUrl.replace(/\/api\/v\d+.*$/i, "").replace(/\/+$/, "");
  }
};

export const joinUrl = (base: string, path: string) => {
  return `${base}/${path.replace(/^\/+/, "")}`;
};

const apiBaseUrl = getApiBaseUrl();

export const env = {
  API_BASE_URL: apiBaseUrl,
  API_ORIGIN: getApiOrigin(apiBaseUrl),
};
