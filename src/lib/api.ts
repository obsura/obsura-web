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
  TextAnalysisRequest,
  TextAnalysisResponse,
  ImageAnalyzeManifest,
  ImageAnalyzeResponse,
  ImageTransformManifest,
  ImageTransformResponse,
  // Studio
  PatternCreate,
  PatternRead,
  PatternUpdate,
  CustomEntityCreate,
  CustomEntityRead,
  CustomEntityUpdate,
  ConfigurationCreate,
  ConfigurationRead,
  ConfigurationUpdate,
  JobRead,
  JobReviewRequest,
  PagedResponse,
} from "./types";
import { env, joinUrl } from "./env";
import { handleApiError } from "./errors";

const API_MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize?: number): number | undefined {
  if (pageSize === undefined) return undefined;
  if (!Number.isFinite(pageSize)) return API_MAX_PAGE_SIZE;
  return Math.max(1, Math.min(API_MAX_PAGE_SIZE, Math.floor(pageSize)));
}

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

// Paged fetch — returns the full { data, pagination } envelope
async function apiFetchPaged<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<PagedResponse<T>> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
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
  return {
    data: json.data ?? [],
    pagination: json.pagination,
  } as PagedResponse<T>;
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

  async analyzeText(
    payload: TextAnalysisRequest,
    signal?: AbortSignal,
  ): Promise<TextAnalysisResponse> {
    return await apiFetch<TextAnalysisResponse>("/workflows/text/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
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

  // ── Studio – Patterns ───────────────────────────────────────────────────────

  async listPatterns(
    params?: { page?: number; page_size?: number },
    signal?: AbortSignal,
  ): Promise<PagedResponse<PatternRead>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    const pageSize = normalizePageSize(params?.page_size);
    if (pageSize !== undefined) qs.set("page_size", String(pageSize));
    return apiFetchPaged<PatternRead>(`/studio/patterns?${qs}`, { signal });
  },

  async createPattern(
    payload: PatternCreate,
    signal?: AbortSignal,
  ): Promise<PatternRead> {
    return apiFetch<PatternRead>("/studio/patterns", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
  },

  async getPattern(id: string, signal?: AbortSignal): Promise<PatternRead> {
    return apiFetch<PatternRead>(`/studio/patterns/${id}`, { signal });
  },

  async updatePattern(
    id: string,
    payload: PatternUpdate,
    signal?: AbortSignal,
  ): Promise<PatternRead> {
    return apiFetch<PatternRead>(`/studio/patterns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      signal,
    });
  },

  // ── Studio – Custom Entities ────────────────────────────────────────────────

  async listEntities(
    params?: { page?: number; page_size?: number },
    signal?: AbortSignal,
  ): Promise<PagedResponse<CustomEntityRead>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    const pageSize = normalizePageSize(params?.page_size);
    if (pageSize !== undefined) qs.set("page_size", String(pageSize));
    return apiFetchPaged<CustomEntityRead>(`/studio/entities?${qs}`, {
      signal,
    });
  },

  async createEntity(
    payload: CustomEntityCreate,
    signal?: AbortSignal,
  ): Promise<CustomEntityRead> {
    return apiFetch<CustomEntityRead>("/studio/entities", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
  },

  async getEntity(id: string, signal?: AbortSignal): Promise<CustomEntityRead> {
    return apiFetch<CustomEntityRead>(`/studio/entities/${id}`, { signal });
  },

  async updateEntity(
    id: string,
    payload: CustomEntityUpdate,
    signal?: AbortSignal,
  ): Promise<CustomEntityRead> {
    return apiFetch<CustomEntityRead>(`/studio/entities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      signal,
    });
  },

  // ── Studio – Configurations ─────────────────────────────────────────────────

  async listConfigurations(
    params?: { page?: number; page_size?: number },
    signal?: AbortSignal,
  ): Promise<PagedResponse<ConfigurationRead>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    const pageSize = normalizePageSize(params?.page_size);
    if (pageSize !== undefined) qs.set("page_size", String(pageSize));
    return apiFetchPaged<ConfigurationRead>(`/studio/configurations?${qs}`, {
      signal,
    });
  },

  async createConfiguration(
    payload: ConfigurationCreate,
    signal?: AbortSignal,
  ): Promise<ConfigurationRead> {
    return apiFetch<ConfigurationRead>("/studio/configurations", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
  },

  async getConfiguration(
    id: string,
    signal?: AbortSignal,
  ): Promise<ConfigurationRead> {
    return apiFetch<ConfigurationRead>(`/studio/configurations/${id}`, {
      signal,
    });
  },

  async updateConfiguration(
    id: string,
    payload: ConfigurationUpdate,
    signal?: AbortSignal,
  ): Promise<ConfigurationRead> {
    return apiFetch<ConfigurationRead>(`/studio/configurations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      signal,
    });
  },

  // ── Jobs ────────────────────────────────────────────────────────────────────

  async listJobs(
    params?: { page?: number; page_size?: number; content_type?: string },
    signal?: AbortSignal,
  ): Promise<PagedResponse<JobRead>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    const pageSize = normalizePageSize(params?.page_size);
    if (pageSize !== undefined) qs.set("page_size", String(pageSize));
    if (params?.content_type) qs.set("content_type", params.content_type);
    return apiFetchPaged<JobRead>(`/jobs?${qs}`, { signal });
  },

  async getJob(id: string, signal?: AbortSignal): Promise<JobRead> {
    return apiFetch<JobRead>(`/jobs/${id}`, { signal });
  },

  async reviewJob(
    id: string,
    payload: JobReviewRequest,
    signal?: AbortSignal,
  ): Promise<JobRead> {
    return apiFetch<JobRead>(`/jobs/${id}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
  },

  // ── Studio – Search ─────────────────────────────────────────────────────────

  async studioSearch(
    q: string,
    params?: { page?: number; page_size?: number },
    signal?: AbortSignal,
  ): Promise<PagedResponse<any>> {
    const qs = new URLSearchParams();
    qs.set("q", q);
    if (params?.page) qs.set("page", String(params.page));
    const pageSize = normalizePageSize(params?.page_size);
    if (pageSize !== undefined) qs.set("page_size", String(pageSize));
    return apiFetchPaged(`/studio/search?${qs.toString()}`, {
      signal,
    });
  },
};
