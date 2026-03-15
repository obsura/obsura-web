import React from "react";
import { Building2, Plus, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { CustomEntityRead } from "../../lib/types";
import { Card, Button, Badge, PanelState } from "../../components/common/UI";

export default function EntityList() {
  const [entities, setEntities] = React.useState<CustomEntityRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    api
      .listEntities({ page: 1, page_size: 50 }, controller.signal)
      .then(({ data, pagination }) => {
        setEntities(data);
        setTotal(pagination.total_items);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Custom Entities</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {loading ? "Loading…" : `${total} entit${total !== 1 ? "ies" : "y"}`}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled
          title="Coming in Phase 3"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          New entity
        </Button>
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
        </Card>
      )}

      {!loading && !error && entities.length > 0 && (
        <div className="space-y-2">
          {entities.map((entity) => (
            <Card
              key={entity.id}
              className="flex items-center gap-4 p-4 hover:shadow-sm transition-shadow"
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
                {entity.description && (
                  <p className="mt-0.5 truncate text-xs text-stone-400">{entity.description}</p>
                )}
              </div>
              <span className="flex-shrink-0 text-[10px] text-stone-400">
                {new Date(entity.created_at).toLocaleDateString()}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
