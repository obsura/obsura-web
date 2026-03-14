import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { TextAnalyzeTransformRequest, TextAnalyzeTransformResponse } from "../lib/types";
import { ApiError } from "../lib/errors";

export const useTextRedaction = () => {
  const [output, setOutput] = useState<TextAnalyzeTransformResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const redactText = useCallback(async (payload: TextAnalyzeTransformRequest) => {
    if (!payload.content.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.analyzeTransformText(payload, abortController.signal);
      setOutput(res);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during text redaction.");
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setOutput(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        // Suppress warning if not fetched
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    output,
    isLoading,
    error,
    redactText,
    reset,
  };
};
