import React from "react";
import { FlaskConical, Plus, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { PatternRead } from "../../lib/types";
import { Card, Button, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";

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
  const [patterns, setPatterns] = React.useState<PatternRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    api
      .listPatterns({ page: 1, page_size: 50 }, controller.signal)
      .then(({ data, pagination }) => {
        setPatterns(data);
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
          <h1 className="text-xl font-semibold text-stone-900">Patterns</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {loading ? "Loading…" : `${total} pattern${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled
          title="Coming in Phase 2"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          New pattern
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
        </Card>
      )}

      {!loading && !error && patterns.length > 0 && (
        <div className="space-y-2">
          {patterns.map((pattern) => (
            <Card
              key={pattern.id}
              className="flex items-center gap-4 p-4 hover:shadow-sm transition-shadow"
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
                {pattern.description && (
                  <p className="mt-0.5 truncate text-xs text-stone-400">{pattern.description}</p>
                )}
              </div>
              <span className="flex-shrink-0 text-[10px] text-stone-400">
                {new Date(pattern.created_at).toLocaleDateString()}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
