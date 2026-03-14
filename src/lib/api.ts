/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HealthResponse,
  ReadyResponse,
  VersionResponse,
  TextAnalyzeTransformRequest,
  TextAnalyzeTransformResponse,
  ImageAnalyzeManifest,
  ImageAnalyzeResponse,
  ImageTransformManifest,
  ImageTransformResponse,
} from "./types";
import { env, joinUrl } from "./env";
import { handleApiError } from "./errors";

// Helper function to centralize frontend fetch logic and CORS/Header configs
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Only auto-attach application/json if there's a JSON body (Not FormData)
  if (options.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(joinUrl(env.API_BASE_URL, endpoint), {
    mode: "cors",
    ...options,
    headers,
  });

  await handleApiError(res);
  const json = await res.json();
  return (json.data ?? json) as T;
}

export const api = {
  async getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return await apiFetch<HealthResponse>("/health", { signal });
  },

  async getReady(signal?: AbortSignal): Promise<ReadyResponse> {
    return await apiFetch<ReadyResponse>("/ready", { signal });
  },

  async getVersion(signal?: AbortSignal): Promise<VersionResponse> {
    return await apiFetch<VersionResponse>("/version", { signal });
  },

  async analyzeTransformText(
    payload: TextAnalyzeTransformRequest,
    signal?: AbortSignal,
  ): Promise<TextAnalyzeTransformResponse> {
    return await apiFetch<TextAnalyzeTransformResponse>(
      "/workflows/text/analyze-transform",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal,
      },
    );
  },

  async analyzeImage(
    file: File,
    manifest: ImageAnalyzeManifest,
    signal?: AbortSignal,
  ): Promise<ImageAnalyzeResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("manifest_json", JSON.stringify(manifest));

    return await apiFetch<ImageAnalyzeResponse>("/workflows/images/analyze", {
      method: "POST",
      body: formData,
      signal,
    });
  },

  async transformImage(
    file: File,
    manifest: ImageTransformManifest,
    signal?: AbortSignal,
  ): Promise<ImageTransformResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("manifest_json", JSON.stringify(manifest));

    return await apiFetch<ImageTransformResponse>(
      "/workflows/images/transform",
      {
        method: "POST",
        body: formData,
        signal,
      },
    );
  },
};
