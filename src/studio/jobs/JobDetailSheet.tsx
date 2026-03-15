import React from "react";
import {
  X,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Sparkles,
  AlertCircle,
  FileText,
  Image,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api } from "../../lib/api";
import { env, joinUrl } from "../../lib/env";
import type { JobRead, JobStatus, FindingRecord, ReviewDecision } from "../../lib/types";
import { Button, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";

// ── helpers ─────────────────────────────────────────────────────────────────

function statusConfig(status: JobStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending", icon: Clock, color: "bg-stone-50 text-stone-600 border-stone-200" };
    case "analyzed":
      return { label: "Analyzed", icon: Sparkles, color: "bg-blue-50 text-blue-700 border-blue-100" };
    case "reviewing":
      return { label: "Reviewing", icon: Eye, color: "bg-amber-50 text-amber-700 border-amber-100" };
    case "reviewed":
      return { label: "Reviewed", icon: CheckCircle2, color: "bg-teal-50 text-teal-700 border-teal-100" };
    case "transformed":
      return { label: "Done", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    case "failed":
      return { label: "Failed", icon: XCircle, color: "bg-red-50 text-red-700 border-red-100" };
    default:
      return { label: status, icon: Loader2, color: "bg-stone-50 text-stone-600 border-stone-200" };
  }
}

function decisionBadge(decision?: ReviewDecision) {
  switch (decision) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-stone-50 text-stone-400 border-stone-200";
  }
}

function decisionLabel(decision?: ReviewDecision) {
  if (decision === "approved") return "Approved";
  if (decision === "rejected") return "Rejected";
  return "Pending";
}

function sourceColor(source: string) {
  switch (source) {
    case "pattern":  return "bg-violet-50 text-violet-700 border-violet-100";
    case "entity":   return "bg-blue-50 text-blue-700 border-blue-100";
    case "builtin":  return "bg-stone-50 text-stone-500 border-stone-200";
    case "manual":   return "bg-amber-50 text-amber-700 border-amber-100";
    default:         return "bg-stone-50 text-stone-500 border-stone-200";
  }
}

function resolveMediaUrl(mediaUrl: string): string {
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  return joinUrl(env.API_ORIGIN, mediaUrl);
}

// ── sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h3>
      {count !== undefined && (
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
          {count}
        </span>
      )}
    </div>
  );
}

function FindingRow({ finding }: { finding: FindingRecord }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
        )}

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
          {finding.matched_text_preview
            ? `"${finding.matched_text_preview.slice(0, 50)}${finding.matched_text_preview.length > 50 ? "…" : ""}"`
            : finding.entity_type}
        </span>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <Badge className={cn("border text-[10px] font-medium", sourceColor(finding.source))}>
            {finding.source}
          </Badge>
          <Badge className={cn("border text-[10px] font-medium", decisionBadge(finding.decision))}>
            {decisionLabel(finding.decision)}
          </Badge>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100 px-3 py-3 space-y-2">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div>
              <dt className="text-stone-400">Entity type</dt>
              <dd className="font-medium text-stone-700">{finding.entity_type}</dd>
            </div>
            {finding.entity_name && (
              <div>
                <dt className="text-stone-400">Entity name</dt>
                <dd className="font-medium text-stone-700">{finding.entity_name}</dd>
              </div>
            )}
            {finding.kind === "text" && finding.start_index != null && (
              <div>
                <dt className="text-stone-400">Position</dt>
                <dd className="font-medium text-stone-700">
                  {finding.start_index}–{finding.end_index ?? "?"}
                </dd>
              </div>
            )}
            {finding.confidence != null && (
              <div>
                <dt className="text-stone-400">Confidence</dt>
                <dd className="font-medium text-stone-700">{(finding.confidence * 100).toFixed(0)}%</dd>
              </div>
            )}
            {finding.region != null && (
              <div className="col-span-2">
                <dt className="text-stone-400">Region</dt>
                <dd className="font-medium text-stone-700">
                  {finding.region.x},{finding.region.y} · {finding.region.width}×{finding.region.height}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

interface JobDetailSheetProps {
  jobId: string;
  onClose: () => void;
  onReview?: (job: JobRead) => void;
}

export default function JobDetailSheet({ jobId, onClose, onReview }: JobDetailSheetProps) {
  const [job, setJob] = React.useState<JobRead | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load job details
  React.useEffect(() => {
    if (!jobId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .getJob(jobId, controller.signal)
      .then((data) => setJob(data))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [jobId]);

  // ESC to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const canReview = job && (job.status === "analyzed" || job.status === "reviewing");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <History className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                {job?.title ?? (loading ? "Loading…" : `Job ${jobId.slice(0, 8)}`)}
              </h2>
              <p className="text-xs text-stone-400">Job details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canReview && onReview && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onReview(job!)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Review findings
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-stone-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <PanelState
              icon={<AlertCircle className="h-8 w-8 text-red-400" />}
              title="Failed to load job"
              description={error}
              tone="error"
            />
          )}

          {!loading && !error && job && (
            <>
              {/* Meta */}
              <section>
                <SectionHeader title="Overview" />
                <div className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <dt className="text-stone-400">Status</dt>
                      <dd className="mt-0.5">
                        {(() => {
                          const { label, icon: Icon, color } = statusConfig(job.status);
                          return (
                            <Badge className={cn("border text-[10px] font-medium flex items-center gap-1 w-fit", color)}>
                              <Icon className="h-3 w-3" />
                              {label}
                            </Badge>
                          );
                        })()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Content type</dt>
                      <dd className="mt-0.5 font-medium text-stone-700 capitalize">{job.content_type}</dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Created</dt>
                      <dd className="mt-0.5 font-medium text-stone-700">
                        {new Date(job.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">Updated</dt>
                      <dd className="mt-0.5 font-medium text-stone-700">
                        {new Date(job.updated_at).toLocaleString()}
                      </dd>
                    </div>
                    {job.pattern_ids.length > 0 && (
                      <div>
                        <dt className="text-stone-400">Patterns</dt>
                        <dd className="mt-0.5 font-medium text-stone-700">{job.pattern_ids.length}</dd>
                      </div>
                    )}
                    {job.custom_entity_ids.length > 0 && (
                      <div>
                        <dt className="text-stone-400">Entities</dt>
                        <dd className="mt-0.5 font-medium text-stone-700">{job.custom_entity_ids.length}</dd>
                      </div>
                    )}
                    {job.configuration_ids.length > 0 && (
                      <div>
                        <dt className="text-stone-400">Configurations</dt>
                        <dd className="mt-0.5 font-medium text-stone-700">{job.configuration_ids.length}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </section>

              {/* Summary */}
              {Object.keys(job.summary).length > 0 && (
                <section>
                  <SectionHeader title="Finding summary" count={Object.keys(job.summary).length} />
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(job.summary).map(([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-100 bg-stone-50 px-3 py-1.5"
                      >
                        <span className="text-xs font-medium text-stone-700">{type}</span>
                        <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Source preview */}
              {job.source_text && (
                <section>
                  <SectionHeader title="Source text" />
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
                      <p className="text-xs leading-relaxed text-stone-700 line-clamp-6">
                        {job.source_text}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Findings */}
              {job.findings.length > 0 && (
                <section>
                  <SectionHeader title="Findings" count={job.findings.length} />
                  <div className="space-y-1.5">
                    {job.findings.map((finding, i) => (
                      <FindingRow key={finding.id ?? i} finding={finding} />
                    ))}
                  </div>
                </section>
              )}

              {/* Outputs */}
              {job.outputs.length > 0 && (
                <section>
                  <SectionHeader title="Outputs" count={job.outputs.length} />
                  <div className="space-y-2">
                    {job.outputs.map((out) => (
                      <div
                        key={out.id}
                        className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-stone-100">
                          {out.content_type === "image" ? (
                            <Image className="h-3.5 w-3.5 text-stone-500" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-stone-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-stone-700 capitalize">{out.content_type}</p>
                          {out.output_text && (
                            <p className="mt-1 text-[11px] leading-relaxed text-stone-500 line-clamp-3">
                              {out.output_text}
                            </p>
                          )}
                          {out.media_url && (
                            <a
                              href={resolveMediaUrl(out.media_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-[11px] text-emerald-600 hover:underline"
                            >
                              View output file
                            </a>
                          )}
                          <p className="mt-1 text-[10px] text-stone-400">
                            {new Date(out.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
