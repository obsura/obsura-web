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
import { env } from "./env";
import { handleApiError } from "./errors";

// Mock data fallbacks for local testing
const MOCK_DELAY = 800;

const mockTextResponse = (content: string): TextAnalyzeTransformResponse => ({
  output_text: content
    .replace(/(\d{4}-\d{4}-\d{4}-\d{4})/g, "[REDACTED_CARD_NUMBER]")
    .replace(
      /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g,
      "[REDACTED_EMAIL]",
    ),
  replacements: [],
  summary: { "Credit Card": 1, Email: 1 },
  job_id: `job_${Math.random().toString(36).substring(2, 11)}`,
});

export const api = {
  async getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    try {
      if (env.MOCK_MODE) throw new Error("Mock");
      const res = await fetch(`${env.API_BASE_URL}/health`, { signal });
      await handleApiError(res);
      const json = await res.json();
      return json.data ?? json;
    } catch (e: any) {
      if (e.name === "AbortError") throw e;
      console.warn("API Health check failed, using mock", e);
      return { status: "ok", timestamp: new Date().toISOString() };
    }
  },

  async getReady(signal?: AbortSignal): Promise<ReadyResponse> {
    try {
      if (env.MOCK_MODE) throw new Error("Mock");
      const res = await fetch(`${env.API_BASE_URL}/ready`, { signal });
      await handleApiError(res);
      const json = await res.json();
      return json.data ?? json;
    } catch (e: any) {
      if (e.name === "AbortError") throw e;
      return { ready: true };
    }
  },

  async getVersion(signal?: AbortSignal): Promise<VersionResponse> {
    try {
      if (env.MOCK_MODE) throw new Error("Mock");
      const res = await fetch(`${env.API_BASE_URL}/version`, { signal });
      await handleApiError(res);
      const json = await res.json();
      return json.data ?? json;
    } catch (e: any) {
      if (e.name === "AbortError") throw e;
      return {
        version: "1.0.0-oss",
        commit: "mock-build",
        build_date: new Date().toISOString(),
      };
    }
  },

  async analyzeTransformText(
    payload: TextAnalyzeTransformRequest,
    signal?: AbortSignal,
  ): Promise<TextAnalyzeTransformResponse> {
    if (env.MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return mockTextResponse(payload.content);
    }

    const res = await fetch(
      `${env.API_BASE_URL}/workflows/text/analyze-transform`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      },
    );

    await handleApiError(res);
    const json = await res.json();
    return json.data ?? json;
  },

  async analyzeImage(
    file: File,
    manifest: ImageAnalyzeManifest,
    signal?: AbortSignal,
  ): Promise<ImageAnalyzeResponse> {
    if (env.MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return {
        regions: [],
        summary: { PII: 3, Faces: 1 },
        job_id: `img_job_${Math.random().toString(36).substring(2, 11)}`,
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("manifest_json", JSON.stringify(manifest));

    const res = await fetch(`${env.API_BASE_URL}/workflows/images/analyze`, {
      method: "POST",
      body: formData,
      signal,
    });

    await handleApiError(res);
    const json = await res.json();
    return json.data ?? json;
  },

  async transformImage(
    file: File,
    manifest: ImageTransformManifest,
    signal?: AbortSignal,
  ): Promise<ImageTransformResponse> {
    if (env.MOCK_MODE) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            output_image_url: reader.result as string,
            job_id: `img_job_${Math.random().toString(36).substring(2, 11)}`,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("manifest_json", JSON.stringify(manifest));

    const res = await fetch(`${env.API_BASE_URL}/workflows/images/transform`, {
      method: "POST",
      body: formData,
      signal,
    });

    await handleApiError(res);
    const json = await res.json();
    return json.data ?? json;
  },
};
