import React from "react";
import { useSearchParams } from "react-router-dom";
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
import { Button, Card, Badge, PanelState, Input, Select } from "../../components/common/UI";
import { cn } from "../../lib/utils";
import JobDetailSheet from "./JobDetailSheet.tsx";
import JobReviewSheet from "./JobReviewSheet.tsx";
import PaginationBar from "../common/PaginationBar";

const PAGE_SIZE = 50;
type ContentFilter = "all" | "text" | "image" | "csv" | "document" | "structured";
type StatusFilter = "all" | JobStatus;
type SortFilter = "newest" | "oldest" | "findings_desc" | "status_asc";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const queryParam = searchParams.get("q") ?? "";
  const contentParam = (searchParams.get("content") as ContentFilter) ?? "all";
  const statusParam = (searchParams.get("status") as StatusFilter) ?? "all";
  const sortParam = (searchParams.get("sort") as SortFilter) ?? "newest";
  const [jobs, setJobs] = React.useState<JobRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(pageParam);
  const [totalPages, setTotalPages] = React.useState(1);
  const [query, setQuery] = React.useState(queryParam);
  const [contentFilter, setContentFilter] = React.useState<ContentFilter>(contentParam);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(statusParam);
  const [sortFilter, setSortFilter] = React.useState<SortFilter>(sortParam);

  // Detail sheet state
  const [detailJobId, setDetailJobId] = React.useState<string | null>(null);

  // Review sheet state
  const [reviewJob, setReviewJob] = React.useState<JobRead | null>(null);

  function loadJobs(signal?: AbortSignal, background = false) {
    if (!background) setLoading(true);
    else setRefreshing(true);
    setError(null);

    api
      .listJobs(
        {
          page,
          page_size: PAGE_SIZE,
          content_type: contentFilter === "all" ? undefined : contentFilter,
        },
        signal
      )
      .then(({ data, pagination }) => {
        setJobs(data);
        setTotal(pagination.total_items);
        setTotalPages(pagination.total_pages);
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
  }, [contentFilter, page]);

  const viewFromQuery = searchParams.get("view");

  React.useEffect(() => {
    const nextPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    if (nextPage !== page) setPage(nextPage);

    const nextQuery = searchParams.get("q") ?? "";
    if (nextQuery !== query) setQuery(nextQuery);

    const nextContent = (searchParams.get("content") as ContentFilter) ?? "all";
    if (nextContent !== contentFilter) setContentFilter(nextContent);

    const nextStatus = (searchParams.get("status") as StatusFilter) ?? "all";
    if (nextStatus !== statusFilter) setStatusFilter(nextStatus);

    const nextSort = (searchParams.get("sort") as SortFilter) ?? "newest";
    if (nextSort !== sortFilter) setSortFilter(nextSort);
  }, [contentFilter, page, query, searchParams, sortFilter, statusFilter]);

  React.useEffect(() => {
    if (!viewFromQuery) return;
    setDetailJobId(viewFromQuery);
  }, [viewFromQuery]);

  const clearViewQuery = React.useCallback(() => {
    if (!viewFromQuery) return;
    const next = new URLSearchParams(searchParams);
    next.delete("view");
    setSearchParams(next, { replace: true });
  }, [viewFromQuery, searchParams, setSearchParams]);

  const updatePageInQuery = React.useCallback(
    (nextPage: number) => {
      const normalized = Math.max(1, nextPage);
      const next = new URLSearchParams(searchParams);
      next.set("page", String(normalized));
      setSearchParams(next, { replace: true });
      setPage(normalized);
    },
    [searchParams, setSearchParams]
  );

  const updateFiltersInQuery = React.useCallback(
    (next: { q?: string; content?: ContentFilter; status?: StatusFilter; sort?: SortFilter }) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");

      const nextQ = (next.q ?? query).trim();
      if (nextQ) params.set("q", nextQ);
      else params.delete("q");

      const nextContent = next.content ?? contentFilter;
      if (nextContent === "all") params.delete("content");
      else params.set("content", nextContent);

      const nextStatus = next.status ?? statusFilter;
      if (nextStatus === "all") params.delete("status");
      else params.set("status", nextStatus);

      const nextSort = next.sort ?? sortFilter;
      if (nextSort === "newest") params.delete("sort");
      else params.set("sort", nextSort);

      setSearchParams(params, { replace: true });
      setPage(1);
      setQuery(nextQ);
      setContentFilter(nextContent);
      setStatusFilter(nextStatus);
      setSortFilter(nextSort);
    },
    [contentFilter, query, searchParams, setSearchParams, sortFilter, statusFilter]
  );

  const visibleJobs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!q) return true;

      const haystack = [job.title ?? "", job.id, job.status, job.content_type].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortFilter === "status_asc") return a.status.localeCompare(b.status);
      if (sortFilter === "findings_desc") return (b.findings?.length ?? 0) - (a.findings?.length ?? 0);
      const av = new Date(a.created_at).getTime();
      const bv = new Date(b.created_at).getTime();
      if (sortFilter === "oldest") return av - bv;
      return bv - av;
    });
  }, [jobs, query, sortFilter, statusFilter]);

  function handleRefresh() {
    loadJobs(undefined, true);
  }

  function handleViewDetail(id: string) {
    setDetailJobId(id);
  }

  function handleDetailClose() {
    setDetailJobId(null);
    clearViewQuery();
  }

  function handleOpenReview(job: JobRead) {
    setDetailJobId(null);
    clearViewQuery();
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

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
        <Input
          value={query}
          onChange={(e) => updateFiltersInQuery({ q: e.target.value })}
          placeholder="Filter this page by title, id, status"
        />
        <Select
          value={contentFilter}
          onChange={(e) => updateFiltersInQuery({ content: e.target.value as ContentFilter })}
        >
          <option value="all">All content</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="csv">CSV</option>
          <option value="document">Document</option>
          <option value="structured">Structured</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => updateFiltersInQuery({ status: e.target.value as StatusFilter })}
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="analyzed">Analyzed</option>
          <option value="reviewing">Reviewing</option>
          <option value="reviewed">Reviewed</option>
          <option value="transformed">Done</option>
          <option value="failed">Failed</option>
        </Select>
        <Select
          value={sortFilter}
          onChange={(e) => updateFiltersInQuery({ sort: e.target.value as SortFilter })}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="findings_desc">Most findings</option>
          <option value="status_asc">Status A-Z</option>
        </Select>
        <div className="flex items-center text-xs text-stone-500">
          Showing {visibleJobs.length} of {jobs.length} on this page
        </div>
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

      {!loading && !error && jobs.length > 0 && visibleJobs.length === 0 && (
        <Card className="p-10">
          <PanelState
            icon={<History className="h-10 w-10 text-stone-300" />}
            title="No matches on this page"
            description="Try different filters, or move to another page."
          />
        </Card>
      )}

      {!loading && !error && jobs.length > 0 && visibleJobs.length > 0 && (
        <>
          <div className="space-y-2">
            {visibleJobs.map((job) => {
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

          <PaginationBar
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={total}
            totalPages={totalPages}
            disabled={loading || refreshing}
            onPageChange={updatePageInQuery}
          />
        </>
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
