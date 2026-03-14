import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { HealthResponse, VersionResponse } from "../lib/types";

export const useApiStatus = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [version, setVersion] = useState<VersionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(false);
    try {
      const [h, v] = await Promise.all([api.getHealth(), api.getVersion()]);
      setHealth(h);
      setVersion(v);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return { health, version, loading, error, refetch: fetchStatus };
};
