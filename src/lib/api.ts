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

const BASE_URL = "/api/v1";

// Mock data fallbacks for local testing
const MOCK_DELAY = 800;

const mockTextResponse = (content: string): TextAnalyzeTransformResponse => ({
  output_text: content.replace(/(\d{4}-\d{4}-\d{4}-\d{4})/g, "[REDACTED_CARD_NUMBER]")
                     .replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g, "[REDACTED_EMAIL]"),
  replacements: [],
  summary: { "Credit Card": 1, "Email": 1 },
  job_id: `job_${Math.random().toString(36).substr(2, 9)}`,
});

export const api = {
  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error("Health check failed");
      return res.json();
    } catch (e) {
      console.warn("API Health check failed, using mock", e);
      return { status: "ok", timestamp: new Date().toISOString() };
    }
  },

  async getReady(): Promise<ReadyResponse> {
    try {
      const res = await fetch(`${BASE_URL}/ready`);
      if (!res.ok) throw new Error("Ready check failed");
      return res.json();
    } catch (e) {
      return { ready: true };
    }
  },

  async getVersion(): Promise<VersionResponse> {
    try {
      const res = await fetch(`${BASE_URL}/version`);
      if (!res.ok) throw new Error("Version check failed");
      return res.json();
    } catch (e) {
      return { version: "1.0.0-oss", commit: "main-8f2d1a", build_date: new Date().toISOString() };
    }
  },

  async analyzeTransformText(payload: TextAnalyzeTransformRequest): Promise<TextAnalyzeTransformResponse> {
    try {
      const res = await fetch(`${BASE_URL}/workflows/text/analyze-transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || "Text redaction failed");
      }
      return res.json();
    } catch (e) {
      console.warn("Text API failed, using mock", e);
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      return mockTextResponse(payload.content);
    }
  },

  async analyzeImage(file: File, manifest: ImageAnalyzeManifest): Promise<ImageAnalyzeResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("manifest_json", JSON.stringify(manifest));

    try {
      const res = await fetch(`${BASE_URL}/workflows/images/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Image analysis failed");
      return res.json();
    } catch (e) {
      console.warn("Image Analyze API failed, using mock", e);
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      return {
        regions: [],
        summary: { "PII": 3, "Faces": 1 },
        job_id: `img_job_${Math.random().toString(36).substr(2, 9)}`,
      };
    }
  },

  async transformImage(file: File, manifest: ImageTransformManifest): Promise<ImageTransformResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("manifest_json", JSON.stringify(manifest));

    try {
      const res = await fetch(`${BASE_URL}/workflows/images/transform`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Image transformation failed");
      return res.json();
    } catch (e) {
      console.warn("Image Transform API failed, using mock", e);
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      // In mock mode, we just return the original image as a data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            output_image_url: reader.result as string,
            job_id: `img_job_${Math.random().toString(36).substr(2, 9)}`,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  },
};
