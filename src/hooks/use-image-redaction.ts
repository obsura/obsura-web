import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import {
  ImageAnalyzeManifest,
  ImageTransformManifest,
  ImageAnalyzeResponse,
  ImageTransformResponse,
} from "../lib/types";
import { ApiError } from "../lib/errors";

export const useImageRedaction = () => {
  const [analysis, setAnalysis] = useState<ImageAnalyzeResponse | null>(null);
  const [output, setOutput] = useState<ImageTransformResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const analyzeImage = useCallback(
    async (file: File, manifest: ImageAnalyzeManifest) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);
      setAnalysis(null);
      setOutput(null);

      try {
        const res = await api.analyzeImage(
          file,
          manifest,
          abortController.signal,
        );
        setAnalysis(res);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(
          err instanceof ApiError ? err.message : "Failed to analyze image",
        );
      } finally {
        if (abortControllerRef.current === abortController) setIsLoading(false);
      }
    },
    [],
  );

  const redactImage = useCallback(
    async (file: File, manifest: ImageTransformManifest) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      try {
        const res = await api.transformImage(
          file,
          manifest,
          abortController.signal,
        );
        setOutput(res);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(
          err instanceof ApiError ? err.message : "Failed to redact image",
        );
      } finally {
        if (abortControllerRef.current === abortController) setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setAnalysis(null);
    setOutput(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    analysis,
    output,
    isLoading,
    error,
    analyzeImage,
    redactImage,
    reset,
  };
};
