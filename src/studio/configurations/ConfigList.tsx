import React from "react";
import { Settings2, Plus, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { ConfigurationRead, ConfigurationKind } from "../../lib/types";
import { Card, Button, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";

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
  const [configs, setConfigs] = React.useState<ConfigurationRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    api
      .listConfigurations({ page: 1, page_size: 50 }, controller.signal)
      .then(({ data, pagination }) => {
        setConfigs(data);
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
          <h1 className="text-xl font-semibold text-stone-900">Configurations</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {loading ? "Loading…" : `${total} configuration${total !== 1 ? "s" : ""}`}
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
          New configuration
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
        </Card>
      )}

      {!loading && !error && configs.length > 0 && (
        <div className="space-y-2">
          {configs.map((config) => (
            <Card
              key={config.id}
              className="flex items-center gap-4 p-4 hover:shadow-sm transition-shadow"
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
                {config.description && (
                  <p className="mt-0.5 truncate text-xs text-stone-400">{config.description}</p>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {(config.pattern_ids?.length ?? 0) > 0 && (
                  <span className="text-[10px] text-stone-400">
                    {config.pattern_ids!.length} pattern{config.pattern_ids!.length !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-[10px] text-stone-400">
                  {new Date(config.created_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
