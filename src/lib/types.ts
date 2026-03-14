/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RedactionMode = "text" | "image";

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
}

export interface ReadyResponse {
  ready: boolean;
}

export interface VersionResponse {
  version: string;
  commit?: string;
  build_date?: string;
}

export type TextTransformationMode =
  | "generic"
  | "semantic"
  | "custom"
  | "partial_mask"
  | "stable_alias"
  | "mask";

export interface TextTransformationConfig {
  mode?: TextTransformationMode;
  placeholder?: string;
  semantic_label?: string;
  alias_prefix?: string;
  prefix_visible?: number;
  suffix_visible?: number;
  mask_character?: string;
}

export interface TextAnalyzeTransformRequest {
  title?: string;
  content: string;
  content_type?: "text";
  apply_builtins?: boolean;
  pattern_ids?: string[];
  custom_entity_ids?: string[];
  configuration_ids?: string[];
  exact_values?: string[];
  manual_spans?: any[];
  default_transformation?: TextTransformationConfig;
  persist_job?: boolean;
  persist_source_content?: boolean;
}

export interface TextReplacement {
  entity_type: string;
  original_text: string;
  transformed_text: string;
  start: number;
  end: number;
}

export interface TextAnalyzeTransformResponse {
  output_text: string;
  replacements: TextReplacement[];
  summary: Record<string, number>;
  job_id: string;
}

export interface ImageAnalyzeManifest {
  title?: string;
  content_type?: "image" | "screenshot";
  configuration_ids?: string[];
  pattern_ids?: string[];
  custom_entity_ids?: string[];
  apply_builtins?: boolean;
  detect_text?: boolean;
  regions?: any[];
  detect_faces?: boolean;
  persist_job?: boolean;
}

export type ImageTransformationMode = "mask" | "blur" | "pixelate" | "overlay";

export interface ImageTransformManifest extends ImageAnalyzeManifest {
  default_transformation?: {
    mode: ImageTransformationMode;
    blur_radius?: number;
    pixelation_scale?: number;
    overlay_color?: string;
    overlay_label?: string;
  };
}

export interface ImageAnalyzeResponse {
  regions: any[];
  summary: Record<string, number>;
  job_id: string;
}

export interface ImageTransformResponse {
  output_image_url: string; // In our case, this might be a blob URL or base64
  job_id: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
