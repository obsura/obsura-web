import React from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { api } from "../../lib/api";
import type { JobRead, FindingRecord, ReviewDecision, JobReviewDecisionInput } from "../../lib/types";
import { Button, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";

// ── helpers ─────────────────────────────────────────────────────────────────

function sourceColor(source: string) {
  switch (source) {
    case "pattern":  return "bg-violet-50 text-violet-700 border-violet-100";
    case "entity":   return "bg-blue-50 text-blue-700 border-blue-100";
    case "builtin":  return "bg-stone-50 text-stone-500 border-stone-200";
    case "manual":   return "bg-amber-50 text-amber-700 border-amber-100";
    default:         return "bg-stone-50 text-stone-500 border-stone-200";
  }
}

type LocalDecision = ReviewDecision;

interface LocalFinding extends FindingRecord {
  localDecision: LocalDecision;
  overrideValue: string;
}

function initLocalFindings(findings: FindingRecord[]): LocalFinding[] {
  return findings.map((f) => ({
    ...f,
    localDecision: f.decision ?? "pending",
    overrideValue: "",
  }));
}

// ── Finding Review Row ───────────────────────────────────────────────────────

interface ReviewRowProps {
  finding: LocalFinding;
  onChange: (id: string, decision: LocalDecision, overrideValue: string) => void;
}

function ReviewRow({ finding, onChange }: ReviewRowProps) {
  const [open, setOpen] = React.useState(false);
  const id = finding.id ?? "";

  const decisionRing: Record<LocalDecision, string> = {
    approved: "ring-emerald-300 bg-emerald-50/50",
    rejected: "ring-red-300 bg-red-50/50",
    pending:  "ring-stone-200 bg-white",
  };

  return (
    <div className={cn("rounded-xl border border-transparent ring-1 transition-colors", decisionRing[finding.localDecision])}>
      {/* Summary row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-shrink-0 text-stone-400 hover:text-stone-600"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <span className="min-w-0 flex-1 truncate text-sm text-stone-800">
          {finding.matched_text_preview
            ? `"${finding.matched_text_preview.slice(0, 45)}${finding.matched_text_preview.length > 45 ? "…" : ""}"`
            : finding.entity_type}
        </span>

        <Badge className={cn("flex-shrink-0 border text-[10px] font-medium", sourceColor(finding.source))}>
          {finding.source}
        </Badge>

        {/* Decision buttons */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            title="Approve"
            onClick={() => onChange(id, "approved", finding.overrideValue)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
              finding.localDecision === "approved"
                ? "border-emerald-300 bg-emerald-500 text-white"
                : "border-stone-200 bg-white text-stone-400 hover:border-emerald-300 hover:text-emerald-600",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Reject"
            onClick={() => onChange(id, "rejected", finding.overrideValue)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
              finding.localDecision === "rejected"
                ? "border-red-300 bg-red-500 text-white"
                : "border-stone-200 bg-white text-stone-400 hover:border-red-300 hover:text-red-600",
            )}
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Reset to pending"
            onClick={() => onChange(id, "pending", finding.overrideValue)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
              finding.localDecision === "pending"
                ? "border-stone-300 bg-stone-200 text-stone-600"
                : "border-stone-200 bg-white text-stone-300 hover:border-stone-300 hover:text-stone-500",
            )}
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Expanded detail + override */}
      {open && (
        <div className="border-t border-stone-100 px-3 py-3 space-y-3">
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
            {finding.confidence != null && (
              <div>
                <dt className="text-stone-400">Confidence</dt>
                <dd className="font-medium text-stone-700">{(finding.confidence * 100).toFixed(0)}%</dd>
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
          </dl>

          {/* Override value */}
          {finding.localDecision === "approved" && (
            <div>
              <label className="mb-1 block text-[11px] font-medium text-stone-500">
                Override redacted value{" "}
                <span className="font-normal text-stone-400">(leave blank to keep default)</span>
              </label>
              <input
                type="text"
                value={finding.overrideValue}
                onChange={(e) => onChange(id, finding.localDecision, e.target.value)}
                placeholder="e.g. [REDACTED]"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

interface JobReviewSheetProps {
  job: JobRead;
  onClose: () => void;
  onReviewed: (updatedJob: JobRead) => void;
}

export default function JobReviewSheet({ job, onClose, onReviewed }: JobReviewSheetProps) {
  const [localFindings, setLocalFindings] = React.useState<LocalFinding[]>(() =>
    initLocalFindings(job.findings),
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ESC to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleDecisionChange(id: string, decision: LocalDecision, overrideValue: string) {
    setLocalFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, localDecision: decision, overrideValue } : f)),
    );
  }

  function applyBulk(decision: LocalDecision) {
    setLocalFindings((prev) => prev.map((f) => ({ ...f, localDecision: decision })));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const decisions: JobReviewDecisionInput[] = localFindings
        .filter((f) => f.id)
        .map((f) => {
          const entry: JobReviewDecisionInput = {
            finding_id: f.id!,
            decision: f.localDecision,
          };
          const trimmed = f.overrideValue.trim();
          if (f.localDecision === "approved" && trimmed) {
            entry.override_value = trimmed;
          }
          return entry;
        });

      const updated = await api.reviewJob(job.id, { decisions });
      onReviewed(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount   = localFindings.filter((f) => f.localDecision === "pending").length;
  const approvedCount  = localFindings.filter((f) => f.localDecision === "approved").length;
  const rejectedCount  = localFindings.filter((f) => f.localDecision === "rejected").length;

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Eye className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                Review findings
              </h2>
              <p className="text-xs text-stone-400">
                {job.title ?? `Job ${job.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-shrink-0 items-center gap-4 border-b border-stone-100 px-6 py-2.5 bg-stone-50/60">
          <span className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="h-2 w-2 rounded-full bg-stone-300" />
            {pendingCount} pending
          </span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {approvedCount} approved
          </span>
          <span className="flex items-center gap-1.5 text-xs text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {rejectedCount} rejected
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyBulk("approved")}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Approve all
            </button>
            <button
              type="button"
              onClick={() => applyBulk("rejected")}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => applyBulk("pending")}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Reset all
            </button>
          </div>
        </div>

        {/* Findings list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {localFindings.length === 0 && (
            <PanelState
              icon={<Eye className="h-8 w-8 text-stone-300" />}
              title="No findings"
              description="This job has no findings to review."
            />
          )}
          {localFindings.map((f, i) => (
            <ReviewRow
              key={f.id ?? i}
              finding={f}
              onChange={handleDecisionChange}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-col gap-2 border-t border-stone-100 px-6 py-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Submit review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
