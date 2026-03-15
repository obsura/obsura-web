import React from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Plus, AlertCircle, PencilLine, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import type { CustomEntityRead } from "../../lib/types";
import { Card, Button, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";
import EntityEditorSheet from "./EntityEditorSheet";
import PaginationBar from "../common/PaginationBar";

const PAGE_SIZE = 50;

export default function EntityList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const [entities, setEntities] = React.useState<CustomEntityRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(Math.max(1, Number.isFinite(pageParam) ? pageParam : 1));
  const [totalPages, setTotalPages] = React.useState(1);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<"create" | "edit">("create");
  const [activeEntityId, setActiveEntityId] = React.useState<string | null>(null);

  const loadEntities = React.useCallback(async (signal?: AbortSignal, background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, pagination } = await api.listEntities({ page, page_size: PAGE_SIZE }, signal);
      setEntities(data);
      setTotal(pagination.total_items);
      setTotalPages(pagination.total_pages);
    } catch (err) {
      if (!(err instanceof Error) || err.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to load entities.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadEntities(controller.signal);
    return () => controller.abort();
  }, [loadEntities]);

  const openFromQuery = searchParams.get("open");

  React.useEffect(() => {
    const nextPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    if (nextPage !== page) setPage(nextPage);
  }, [page, searchParams]);

  React.useEffect(() => {
    if (!openFromQuery) return;
    setEditorMode("edit");
    setActiveEntityId(openFromQuery);
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

  const openCreate = React.useCallback(() => {
    setEditorMode("create");
    setActiveEntityId(null);
    setEditorOpen(true);
  }, []);

  const openEdit = React.useCallback((entityId: string) => {
    setEditorMode("edit");
    setActiveEntityId(entityId);
    setEditorOpen(true);
  }, []);

  const onSaved = React.useCallback(async () => {
    setEditorOpen(false);
    setActiveEntityId(null);
    clearOpenQuery();
    await loadEntities(undefined, true);
  }, [clearOpenQuery, loadEntities]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Custom Entities</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {loading ? "Loading…" : `${total} entit${total !== 1 ? "ies" : "y"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadEntities(undefined, true)}
            isLoading={refreshing}
            className="flex items-center gap-1.5"
          >
            {!refreshing ? <RefreshCw className="h-3.5 w-3.5" /> : null}
            Refresh
          </Button>
          <Button variant="primary" size="sm" className="flex items-center gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New entity
          </Button>
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
            title="Failed to load entities"
            description={error}
            tone="error"
          />
        </Card>
      )}

      {!loading && !error && entities.length === 0 && (
        <Card className="p-10">
          <PanelState
            icon={<Building2 className="h-10 w-10 text-stone-300" />}
            title="No custom entities yet"
            description="Custom entities let you define named types (e.g. EMPLOYEE_ID) with one or more detection rules. They can be referenced in configurations."
          />
          <div className="mt-6 flex justify-center">
            <Button variant="primary" className="flex items-center gap-1.5" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create first entity
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && entities.length > 0 && (
        <>
          <div className="space-y-2">
            {entities.map((entity) => (
            <Card
              key={entity.id}
              className={cn(
                "flex items-center gap-4 p-4 hover:shadow-sm transition-shadow",
                editorOpen && activeEntityId === entity.id ? "ring-2 ring-blue-200" : ""
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-stone-900">{entity.name}</p>
                  {entity.detection_definitions && entity.detection_definitions.length > 0 && (
                    <Badge className="flex-shrink-0 border border-blue-100 bg-blue-50 text-[10px] font-medium text-blue-700">
                      {entity.detection_definitions.length} rule{entity.detection_definitions.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {!entity.is_active && (
                    <Badge className="flex-shrink-0 border border-stone-100 bg-stone-50 text-[10px] font-medium text-stone-500">
                      Inactive
                    </Badge>
                  )}
                </div>
                {entity.description ? <p className="mt-0.5 truncate text-xs text-stone-400">{entity.description}</p> : <p className="mt-0.5 truncate text-xs text-stone-300">No description</p>}
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <span className="text-[10px] text-stone-400">
                  {new Date(entity.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => openEdit(entity.id)}
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

      <EntityEditorSheet
        open={editorOpen}
        mode={editorMode}
        entityId={activeEntityId}
        onClose={() => {
          setEditorOpen(false);
          setActiveEntityId(null);
          clearOpenQuery();
        }}
        onSaved={onSaved}
      />
    </div>
  );
}
