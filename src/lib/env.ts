export const env = {
  API_BASE_URL:
    (window as any)._env_?.VITE_API_BASE_URL ||
    (import.meta as any).env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api/v1",
  MOCK_MODE:
    ((window as any)._env_?.VITE_MOCK_MODE ||
      (import.meta as any).env.VITE_MOCK_MODE) === "true",
};
