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
  start_index?: number;
  end_index?: number;
  original_preview?: string;
  output_value?: string;

  // Backwards compatibility fallbacks just in case
  original_text?: string;
  transformed_text?: string;
  start?: number;
  end?: number;
}

export interface TextAnalyzeTransformResponse {
  output_text: string;
  replacements: TextReplacement[];
  summary: Record<string, number>;
  job_id: string | null;
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
  media_url?: string;
  output_image_url?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PagedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ── Studio – shared primitives ────────────────────────────────────────────────

export type MatcherKind = "regex" | "exact" | "list" | "spacy" | "deny_list";

export type TransformationMode =
  | "generic"
  | "semantic"
  | "mask"
  | "partial_mask"
  | "stable_alias"
  | "custom"
  | "blur"
  | "pixelate"
  | "overlay";

export interface TransformationRule {
  mode?: TransformationMode;
  placeholder?: string;
  semantic_label?: string;
  alias_prefix?: string;
  prefix_visible?: number;
  suffix_visible?: number;
  mask_character?: string;
  blur_radius?: number;
  overlay_color?: string;
  overlay_label?: string;
}

export interface PatternMatcherDefinition {
  kind: MatcherKind;
  value?: string | null;
  values?: string[];
  case_sensitive?: boolean;
}

// ── Studio – Patterns ─────────────────────────────────────────────────────────

export interface PatternCreate {
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  is_active?: boolean;
  matcher: PatternMatcherDefinition;
  transformation?: TransformationRule | null;
}

export interface PatternRead extends PatternCreate {
  id: string;
  created_at: string;
  updated_at: string;
}

export type PatternUpdate = Partial<PatternCreate>;

// ── Studio – Custom Entities ──────────────────────────────────────────────────

export interface CustomEntityCreate {
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  is_active?: boolean;
  detection_definitions?: PatternMatcherDefinition[];
  transformation?: TransformationRule | null;
}

export interface CustomEntityRead extends CustomEntityCreate {
  id: string;
  created_at: string;
  updated_at: string;
}

export type CustomEntityUpdate = Partial<CustomEntityCreate>;

// ── Studio – Configurations ───────────────────────────────────────────────────

export type ConfigurationKind = "pack" | "profile" | "preset";

export interface ConfigurationCreate {
  kind: ConfigurationKind;
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  is_active?: boolean;
  pattern_ids?: string[];
  custom_entity_ids?: string[];
  default_text_transformation?: TransformationRule | null;
  default_image_transformation?: TransformationRule | null;
}

export interface ConfigurationRead extends ConfigurationCreate {
  id: string;
  created_at: string;
  updated_at: string;
}

export type ConfigurationUpdate = Partial<ConfigurationCreate>;

// ── Jobs ──────────────────────────────────────────────────────────────────────

export type JobStatus =
  | "pending"
  | "analyzed"
  | "reviewing"
  | "reviewed"
  | "transformed"
  | "failed";
export type ContentType = "text" | "image" | "csv" | "document" | "structured";
export type FindingSource = "builtin" | "pattern" | "entity" | "manual";
export type FindingKind = "text" | "image_region";
export type ReviewDecision = "pending" | "approved" | "rejected";

export interface FindingRecord {
  id?: string | null;
  job_id?: string | null;
  source: FindingSource;
  kind: FindingKind;
  entity_type: string;
  entity_name?: string | null;
  start_index?: number | null;
  end_index?: number | null;
  original_preview?: string | null;
  output_value?: string | null;
  score?: number | null;
  review_decision?: ReviewDecision;
}

export interface JobOutputRecord {
  id: string;
  created_at: string;
  output_type: string;
  media_url?: string | null;
  text_preview?: string | null;
}

export interface JobRead {
  id: string;
  created_at: string;
  updated_at: string;
  title?: string | null;
  status: JobStatus;
  content_type: ContentType;
  source_text?: string | null;
  source_file_path?: string | null;
  pattern_ids: string[];
  custom_entity_ids: string[];
  configuration_ids: string[];
  summary: Record<string, number>;
  findings: FindingRecord[];
  outputs: JobOutputRecord[];
}

export interface JobReviewDecisionInput {
  finding_id: string;
  decision: ReviewDecision;
  override_value?: string | null;
}

export interface JobReviewRequest {
  decisions: JobReviewDecisionInput[];
}
