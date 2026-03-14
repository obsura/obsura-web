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

export const joinUrl = (base: string, path: string) => {
  return `${base}/${path.replace(/^\/+/, "")}`;
};

export const env = {
  API_BASE_URL: getApiBaseUrl(),
};
