import React from "react";
import { useSearchParams } from "react-router-dom";
import { FlaskConical, Plus, AlertCircle, PencilLine, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import type { PatternRead } from "../../lib/types";
import { Card, Button, Badge, PanelState, Input, Select } from "../../components/common/UI";
import { cn } from "../../lib/utils";
import PatternEditorSheet from "./PatternEditorSheet";
import PaginationBar from "../common/PaginationBar";

const PAGE_SIZE = 50;
type ActiveFilter = "all" | "active" | "inactive";
type SortFilter = "newest" | "oldest" | "name_asc" | "name_desc";

function matcherKindLabel(kind: string) {
  const labels: Record<string, string> = {
    regex: "Regex",
    exact: "Exact",
    list: "List",
    spacy: "spaCy",
    deny_list: "Deny list",
  };
  return labels[kind] ?? kind;
}

function matcherKindColor(kind: string) {
  const colors: Record<string, string> = {
    regex: "bg-violet-50 text-violet-700 border-violet-100",
    exact: "bg-blue-50 text-blue-700 border-blue-100",
    list: "bg-cyan-50 text-cyan-700 border-cyan-100",
    spacy: "bg-amber-50 text-amber-700 border-amber-100",
    deny_list: "bg-red-50 text-red-700 border-red-100",
  };
  return colors[kind] ?? "bg-stone-50 text-stone-700 border-stone-100";
}

export default function PatternList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const queryParam = searchParams.get("q") ?? "";
  const activeParam = (searchParams.get("active") as ActiveFilter) ?? "all";
  const sortParam = (searchParams.get("sort") as SortFilter) ?? "newest";

  const [patterns, setPatterns] = React.useState<PatternRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(pageParam);
  const [totalPages, setTotalPages] = React.useState(1);
  const [query, setQuery] = React.useState(queryParam);
  const [activeFilter, setActiveFilter] = React.useState<ActiveFilter>(activeParam);
  const [sortFilter, setSortFilter] = React.useState<SortFilter>(sortParam);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<"create" | "edit">("create");
  const [activePatternId, setActivePatternId] = React.useState<string | null>(null);

  const loadPatterns = React.useCallback(async (signal?: AbortSignal, background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, pagination } = await api.listPatterns({ page, page_size: PAGE_SIZE }, signal);
      setPatterns(data);
      setTotal(pagination.total_items);
      setTotalPages(pagination.total_pages);
    } catch (err) {
      if (!(err instanceof Error) || err.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to load patterns.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadPatterns(controller.signal);
    return () => controller.abort();
  }, [loadPatterns]);

  const openFromQuery = searchParams.get("open");

  React.useEffect(() => {
    const nextPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    if (nextPage !== page) setPage(nextPage);

    const nextQuery = searchParams.get("q") ?? "";
    if (nextQuery !== query) setQuery(nextQuery);

    const nextActive = (searchParams.get("active") as ActiveFilter) ?? "all";
    if (nextActive !== activeFilter) setActiveFilter(nextActive);

    const nextSort = (searchParams.get("sort") as SortFilter) ?? "newest";
    if (nextSort !== sortFilter) setSortFilter(nextSort);
  }, [activeFilter, page, query, searchParams, sortFilter]);

  React.useEffect(() => {
    if (!openFromQuery) return;
    setEditorMode("edit");
    setActivePatternId(openFromQuery);
    setEditorOpen(true);
  }, [openFromQuery]);

  const clearOpenQuery = React.useCallback(() => {
    if (!openFromQuery) return;
    const next = new URLSearchParams(searchParams);
    next.delete("open");
    setSearchParams(next, { replace: true });
  }, [openFromQuery, searchParams, setSearchParams]);

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
    (next: { q?: string; active?: ActiveFilter; sort?: SortFilter }) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");

      const nextQ = (next.q ?? query).trim();
      if (nextQ) params.set("q", nextQ);
      else params.delete("q");

      const nextActive = next.active ?? activeFilter;
      if (nextActive === "all") params.delete("active");
      else params.set("active", nextActive);

      const nextSort = next.sort ?? sortFilter;
      if (nextSort === "newest") params.delete("sort");
      else params.set("sort", nextSort);

      setSearchParams(params, { replace: true });
      setPage(1);
      setQuery(nextQ);
      setActiveFilter(nextActive);
      setSortFilter(nextSort);
    },
    [activeFilter, query, searchParams, setSearchParams, sortFilter]
  );

  const visiblePatterns = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = patterns.filter((pattern) => {
      if (activeFilter === "active" && !pattern.is_active) return false;
      if (activeFilter === "inactive" && pattern.is_active) return false;
      if (!q) return true;

      const haystack = [
        pattern.name,
        pattern.description ?? "",
        pattern.category ?? "",
        ...(pattern.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortFilter === "name_asc") return a.name.localeCompare(b.name);
      if (sortFilter === "name_desc") return b.name.localeCompare(a.name);
      const av = new Date(a.created_at).getTime();
      const bv = new Date(b.created_at).getTime();
      if (sortFilter === "oldest") return av - bv;
      return bv - av;
    });
  }, [activeFilter, patterns, query, sortFilter]);

  const handleCreate = React.useCallback(() => {
    setEditorMode("create");
    setActivePatternId(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = React.useCallback((patternId: string) => {
    setEditorMode("edit");
    setActivePatternId(patternId);
    setEditorOpen(true);
  }, []);

  const handleSaved = React.useCallback(async () => {
    setEditorOpen(false);
    setActivePatternId(null);
    clearOpenQuery();
    await loadPatterns(undefined, true);
  }, [clearOpenQuery, loadPatterns]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Patterns</h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {loading ? "Loading…" : `${total} pattern${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPatterns(undefined, true)}
              isLoading={refreshing}
              className="flex items-center gap-1.5"
            >
              {!refreshing ? <RefreshCw className="h-3.5 w-3.5" /> : null}
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New pattern
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <Input
            value={query}
            onChange={(e) => updateFiltersInQuery({ q: e.target.value })}
            placeholder="Filter this page by name, tag, category"
          />
          <Select
            value={activeFilter}
            onChange={(e) => updateFiltersInQuery({ active: e.target.value as ActiveFilter })}
          >
            <option value="all">All states</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </Select>
          <Select
            value={sortFilter}
            onChange={(e) => updateFiltersInQuery({ sort: e.target.value as SortFilter })}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </Select>
          <div className="flex items-center text-xs text-stone-500">
            Showing {visiblePatterns.length} of {patterns.length} on this page
          </div>
        </div>

      {/* Body */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100" />
            ))}
          </div>
        )}

        {!loading && error && (
          <Card className="p-6">
            <PanelState
              icon={<AlertCircle className="h-8 w-8 text-red-400" />}
              title="Failed to load patterns"
              description={error}
              tone="error"
            />
          </Card>
        )}

        {!loading && !error && patterns.length === 0 && (
          <Card className="p-10">
            <PanelState
              icon={<FlaskConical className="h-10 w-10 text-stone-300" />}
              title="No patterns yet"
              description="Patterns let you define what to detect using regex, exact match, or list matchers. Create your first pattern to get started."
            />
            <div className="mt-6 flex justify-center">
              <Button variant="primary" onClick={handleCreate} className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Create first pattern
              </Button>
            </div>
          </Card>
        )}

        {!loading && !error && patterns.length > 0 && visiblePatterns.length === 0 && (
          <Card className="p-10">
            <PanelState
              icon={<FlaskConical className="h-10 w-10 text-stone-300" />}
              title="No matches on this page"
              description="Try a different filter, or move to another page."
            />
          </Card>
        )}

        {!loading && !error && patterns.length > 0 && visiblePatterns.length > 0 && (
          <>
            <div className="space-y-2">
              {visiblePatterns.map((pattern) => (
              <Card
                key={pattern.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-shadow hover:shadow-sm",
                  activePatternId === pattern.id && editorOpen && "ring-2 ring-indigo-200"
                )}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
                  <FlaskConical className="h-4 w-4 text-violet-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-stone-900">{pattern.name}</p>
                    <Badge
                      className={cn("flex-shrink-0 border text-[10px] font-medium", matcherKindColor(pattern.matcher.kind))}
                    >
                      {matcherKindLabel(pattern.matcher.kind)}
                    </Badge>
                    {!pattern.is_active && (
                      <Badge className="flex-shrink-0 border border-stone-100 bg-stone-50 text-[10px] font-medium text-stone-500">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {pattern.description ? (
                    <p className="mt-0.5 truncate text-xs text-stone-400">{pattern.description}</p>
                  ) : (
                    <p className="mt-0.5 truncate text-xs text-stone-300">No description</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="text-[10px] text-stone-400">
                    {new Date(pattern.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(pattern.id)}
                    className="flex items-center gap-1.5"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </Card>
              ))}
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
      </div>

      <PatternEditorSheet
        open={editorOpen}
        mode={editorMode}
        patternId={activePatternId}
        onClose={() => {
          setEditorOpen(false);
          setActivePatternId(null);
          clearOpenQuery();
        }}
        onSaved={handleSaved}
      />
    </>
  );
}
