import React from "react";
import { useSearchParams } from "react-router-dom";
import { Settings2, Plus, AlertCircle, PencilLine, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import type { ConfigurationRead, ConfigurationKind } from "../../lib/types";
import { Card, Button, Badge, PanelState, Input, Select } from "../../components/common/UI";
import { cn } from "../../lib/utils";
import ConfigEditorSheet from "./ConfigEditorSheet";
import PaginationBar from "../common/PaginationBar";

const PAGE_SIZE = 50;
type ActiveFilter = "all" | "active" | "inactive";
type KindFilter = "all" | ConfigurationKind;
type SortFilter = "newest" | "oldest" | "name_asc" | "name_desc";

function kindLabel(kind: ConfigurationKind) {
  return { pack: "Pack", profile: "Profile", preset: "Preset" }[kind] ?? kind;
}

function kindColor(kind: ConfigurationKind) {
  return {
    pack: "bg-amber-50 text-amber-700 border-amber-100",
    profile: "bg-teal-50 text-teal-700 border-teal-100",
    preset: "bg-indigo-50 text-indigo-700 border-indigo-100",
  }[kind] ?? "bg-stone-50 text-stone-700 border-stone-100";
}

export default function ConfigList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const queryParam = searchParams.get("q") ?? "";
  const activeParam = (searchParams.get("active") as ActiveFilter) ?? "all";
  const kindParam = (searchParams.get("kind") as KindFilter) ?? "all";
  const sortParam = (searchParams.get("sort") as SortFilter) ?? "newest";
  const [configs, setConfigs] = React.useState<ConfigurationRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(pageParam);
  const [totalPages, setTotalPages] = React.useState(1);
  const [query, setQuery] = React.useState(queryParam);
  const [activeFilter, setActiveFilter] = React.useState<ActiveFilter>(activeParam);
  const [kindFilter, setKindFilter] = React.useState<KindFilter>(kindParam);
  const [sortFilter, setSortFilter] = React.useState<SortFilter>(sortParam);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<"create" | "edit">("create");
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);

  const loadConfigs = React.useCallback(async (signal?: AbortSignal, background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, pagination } = await api.listConfigurations({ page, page_size: PAGE_SIZE }, signal);
      setConfigs(data);
      setTotal(pagination.total_items);
      setTotalPages(pagination.total_pages);
    } catch (err) {
      if (!(err instanceof Error) || err.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to load configurations.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadConfigs(controller.signal);
    return () => controller.abort();
  }, [loadConfigs]);

  const openFromQuery = searchParams.get("open");

  React.useEffect(() => {
    const nextPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    if (nextPage !== page) setPage(nextPage);

    const nextQuery = searchParams.get("q") ?? "";
    if (nextQuery !== query) setQuery(nextQuery);

    const nextActive = (searchParams.get("active") as ActiveFilter) ?? "all";
    if (nextActive !== activeFilter) setActiveFilter(nextActive);

    const nextKind = (searchParams.get("kind") as KindFilter) ?? "all";
    if (nextKind !== kindFilter) setKindFilter(nextKind);

    const nextSort = (searchParams.get("sort") as SortFilter) ?? "newest";
    if (nextSort !== sortFilter) setSortFilter(nextSort);
  }, [activeFilter, kindFilter, page, query, searchParams, sortFilter]);

  React.useEffect(() => {
    if (!openFromQuery) return;
    setEditorMode("edit");
    setActiveConfigId(openFromQuery);
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
    (next: { q?: string; active?: ActiveFilter; kind?: KindFilter; sort?: SortFilter }) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");

      const nextQ = (next.q ?? query).trim();
      if (nextQ) params.set("q", nextQ);
      else params.delete("q");

      const nextActive = next.active ?? activeFilter;
      if (nextActive === "all") params.delete("active");
      else params.set("active", nextActive);

      const nextKind = next.kind ?? kindFilter;
      if (nextKind === "all") params.delete("kind");
      else params.set("kind", nextKind);

      const nextSort = next.sort ?? sortFilter;
      if (nextSort === "newest") params.delete("sort");
      else params.set("sort", nextSort);

      setSearchParams(params, { replace: true });
      setPage(1);
      setQuery(nextQ);
      setActiveFilter(nextActive);
      setKindFilter(nextKind);
      setSortFilter(nextSort);
    },
    [activeFilter, kindFilter, query, searchParams, setSearchParams, sortFilter]
  );

  const visibleConfigs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = configs.filter((config) => {
      if (activeFilter === "active" && !config.is_active) return false;
      if (activeFilter === "inactive" && config.is_active) return false;
      if (kindFilter !== "all" && config.kind !== kindFilter) return false;
      if (!q) return true;

      const haystack = [
        config.name,
        config.description ?? "",
        config.category ?? "",
        ...(config.tags ?? []),
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
  }, [activeFilter, configs, kindFilter, query, sortFilter]);

  const openCreate = React.useCallback(() => {
    setEditorMode("create");
    setActiveConfigId(null);
    setEditorOpen(true);
  }, []);

  const openEdit = React.useCallback((configId: string) => {
    setEditorMode("edit");
    setActiveConfigId(configId);
    setEditorOpen(true);
  }, []);

  const onSaved = React.useCallback(async () => {
    setEditorOpen(false);
    setActiveConfigId(null);
    clearOpenQuery();
    await loadConfigs(undefined, true);
  }, [clearOpenQuery, loadConfigs]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Configurations</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {loading ? "Loading…" : `${total} configuration${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadConfigs(undefined, true)}
            isLoading={refreshing}
            className="flex items-center gap-1.5"
          >
            {!refreshing ? <RefreshCw className="h-3.5 w-3.5" /> : null}
            Refresh
          </Button>
          <Button variant="primary" size="sm" className="flex items-center gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New configuration
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
        <Input
          value={query}
          onChange={(e) => updateFiltersInQuery({ q: e.target.value })}
          placeholder="Filter this page by name, tag, category"
        />
        <Select
          value={kindFilter}
          onChange={(e) => updateFiltersInQuery({ kind: e.target.value as KindFilter })}
        >
          <option value="all">All kinds</option>
          <option value="pack">Pack</option>
          <option value="profile">Profile</option>
          <option value="preset">Preset</option>
        </Select>
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
          Showing {visibleConfigs.length} of {configs.length} on this page
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
            title="Failed to load configurations"
            description={error}
            tone="error"
          />
        </Card>
      )}

      {!loading && !error && configs.length === 0 && (
        <Card className="p-10">
          <PanelState
            icon={<Settings2 className="h-10 w-10 text-stone-300" />}
            title="No configurations yet"
            description="Configurations (packs, profiles, presets) bundle patterns and custom entities together. Reference them when running redaction jobs."
          />
          <div className="mt-6 flex justify-center">
            <Button variant="primary" className="flex items-center gap-1.5" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create first configuration
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && configs.length > 0 && visibleConfigs.length === 0 && (
        <Card className="p-10">
          <PanelState
            icon={<Settings2 className="h-10 w-10 text-stone-300" />}
            title="No matches on this page"
            description="Try different filters, or move to another page."
          />
        </Card>
      )}

      {!loading && !error && configs.length > 0 && visibleConfigs.length > 0 && (
        <>
          <div className="space-y-2">
            {visibleConfigs.map((config) => (
            <Card
              key={config.id}
              className={cn(
                "flex items-center gap-4 p-4 hover:shadow-sm transition-shadow",
                editorOpen && activeConfigId === config.id ? "ring-2 ring-amber-200" : ""
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <Settings2 className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-stone-900">{config.name}</p>
                  <Badge className={cn("flex-shrink-0 border text-[10px] font-medium", kindColor(config.kind))}>
                    {kindLabel(config.kind)}
                  </Badge>
                  {!config.is_active && (
                    <Badge className="flex-shrink-0 border border-stone-100 bg-stone-50 text-[10px] font-medium text-stone-500">
                      Inactive
                    </Badge>
                  )}
                </div>
                {config.description ? <p className="mt-0.5 truncate text-xs text-stone-400">{config.description}</p> : <p className="mt-0.5 truncate text-xs text-stone-300">No description</p>}
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {(config.pattern_ids?.length ?? 0) > 0 && (
                  <span className="text-[10px] text-stone-400">
                    {config.pattern_ids!.length} pattern{config.pattern_ids!.length !== 1 ? "s" : ""}
                  </span>
                )}
                {(config.custom_entity_ids?.length ?? 0) > 0 && (
                  <span className="text-[10px] text-stone-400">
                    {config.custom_entity_ids!.length} entit{config.custom_entity_ids!.length !== 1 ? "ies" : "y"}
                  </span>
                )}
                <span className="text-[10px] text-stone-400">
                  {new Date(config.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => openEdit(config.id)}
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

      <ConfigEditorSheet
        open={editorOpen}
        mode={editorMode}
        configId={activeConfigId}
        onClose={() => {
          setEditorOpen(false);
          setActiveConfigId(null);
          clearOpenQuery();
        }}
        onSaved={onSaved}
      />
    </div>
  );
}
