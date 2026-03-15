import React from "react";
import {
  History,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import type { JobRead, JobStatus } from "../../lib/types";
import { Button, Card, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";
import JobDetailSheet from "./JobDetailSheet.tsx";
import JobReviewSheet from "./JobReviewSheet.tsx";

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

function contentTypeLabel(ct: string) {
  return { text: "Text", image: "Image", csv: "CSV", document: "Document", structured: "Structured" }[ct] ?? ct;
}

export default function JobList() {
  const [jobs, setJobs] = React.useState<JobRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  // Detail sheet state
  const [detailJobId, setDetailJobId] = React.useState<string | null>(null);

  // Review sheet state
  const [reviewJob, setReviewJob] = React.useState<JobRead | null>(null);

  function loadJobs(signal?: AbortSignal, background = false) {
    if (!background) setLoading(true);
    else setRefreshing(true);
    setError(null);

    api
      .listJobs({ page: 1, page_size: 50 }, signal)
      .then(({ data, pagination }) => {
        setJobs(data);
        setTotal(pagination.total_items);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  React.useEffect(() => {
    const controller = new AbortController();
    loadJobs(controller.signal);
    return () => controller.abort();
  }, []);

  function handleRefresh() {
    loadJobs(undefined, true);
  }

  function handleViewDetail(id: string) {
    setDetailJobId(id);
  }

  function handleDetailClose() {
    setDetailJobId(null);
  }

  function handleOpenReview(job: JobRead) {
    setDetailJobId(null);
    setReviewJob(job);
  }

  function handleReviewClose() {
    setReviewJob(null);
  }

  function handleReviewed(updatedJob: JobRead) {
    setReviewJob(null);
    // Replace the updated job in the list and refreshing in background
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    // Also do a soft refresh in background to sync full list
    loadJobs(undefined, true);
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Job History</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {loading ? "Loading…" : `${total} job${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || refreshing}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Body */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="p-6">
          <PanelState
            icon={<AlertCircle className="h-8 w-8 text-red-400" />}
            title="Failed to load jobs"
            description={error}
            tone="error"
          />
        </Card>
      )}

      {!loading && !error && jobs.length === 0 && (
        <Card className="p-10">
          <PanelState
            icon={<History className="h-10 w-10 text-stone-300" />}
            title="No jobs yet"
            description="Redaction jobs will appear here after you run text or image redaction from the main app. You can review and approve findings from this panel."
          />
        </Card>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => {
            const { label, icon: StatusIcon, color } = statusConfig(job.status);
            const findingCount = job.findings?.length ?? 0;
            const canReview = job.status === "analyzed" || job.status === "reviewing";
            return (
              <Card
                key={job.id}
                className={cn(
                  "flex items-center gap-4 p-4 hover:shadow-sm transition-shadow",
                  detailJobId === job.id && "ring-2 ring-emerald-300 ring-offset-1",
                )}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <History className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {job.title ?? `Job ${job.id.slice(0, 8)}`}
                    </p>
                    <Badge className={cn("flex-shrink-0 border text-[10px] font-medium flex items-center gap-1", color)}>
                      <StatusIcon className="h-3 w-3" />
                      {label}
                    </Badge>
                    <Badge className="flex-shrink-0 border border-stone-100 bg-stone-50 text-[10px] font-medium text-stone-500">
                      {contentTypeLabel(job.content_type)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {findingCount} finding{findingCount !== 1 ? "s" : ""}
                    {" · "}
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {canReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReview(job)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Review
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(job.id)}
                  >
                    View
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail sheet */}
      {detailJobId && (
        <JobDetailSheet
          jobId={detailJobId}
          onClose={handleDetailClose}
          onReview={handleOpenReview}
        />
      )}

      {/* Review sheet */}
      {reviewJob && (
        <JobReviewSheet
          job={reviewJob}
          onClose={handleReviewClose}
          onReviewed={handleReviewed}
        />
      )}
    </div>
  );
}
