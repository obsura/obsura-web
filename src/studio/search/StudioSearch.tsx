import React from "react";
import { Search, AlertCircle, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { Button, Card, Input, Badge, PanelState } from "../../components/common/UI";
import { cn } from "../../lib/utils";

type SearchRecord = Record<string, unknown>;

interface ParsedResult {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  href: string | null;
  raw: SearchRecord;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function guessKind(raw: SearchRecord): string {
  const candidates = [
    asString(raw.resource_type),
    asString(raw.resource_kind),
    asString(raw.type),
    asString(raw.kind),
    asString(raw.source),
  ].filter(Boolean) as string[];

  if (candidates.length > 0) return candidates[0].toLowerCase();

  if ("pattern_ids" in raw || "custom_entity_ids" in raw || "configuration_ids" in raw) return "job";
  if ("matcher" in raw || "transformation" in raw) return "pattern";
  if ("detection_definitions" in raw) return "entity";

  return "record";
}

function buildHref(kind: string, id: string): string | null {
  if (kind.includes("pattern")) return `/studio/patterns?open=${encodeURIComponent(id)}`;
  if (kind.includes("entit")) return `/studio/entities?open=${encodeURIComponent(id)}`;
  if (kind.includes("config") || kind.includes("preset") || kind.includes("profile") || kind.includes("pack")) {
    return `/studio/configurations?open=${encodeURIComponent(id)}`;
  }
  if (kind.includes("job")) return `/studio/jobs?view=${encodeURIComponent(id)}`;
  return null;
}

function parseResult(raw: SearchRecord, i: number): ParsedResult {
  const id = asString(raw.id) ?? `result-${i}`;
  const kind = guessKind(raw);
  const title =
    asString(raw.title) ??
    asString(raw.name) ??
    asString(raw.label) ??
    asString(raw.entity_name) ??
    asString(raw.entity_type) ??
    `Result ${i + 1}`;

  const subtitleParts = [
    asString(raw.description),
    asString(raw.category),
    asString(raw.status),
    asString(raw.content_type),
  ].filter(Boolean) as string[];

  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" • ") : "No extra details";
  const href = buildHref(kind, id);

  return { id, kind, title, subtitle, href, raw };
}

export default function StudioSearch() {
  const [query, setQuery] = React.useState("");
  const [submittedQuery, setSubmittedQuery] = React.useState("");
  const [results, setResults] = React.useState<ParsedResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function runSearch(value: string) {
    const q = value.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSubmittedQuery(q);

    try {
      const response = await api.studioSearch(q);
      const rows = Array.isArray(response.data) ? response.data : [];
      setResults(rows.map((item, i) => parseResult(item as SearchRecord, i)));
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-stone-900">Studio Search</h1>
        <p className="mt-1 text-sm text-stone-500">
          Search across patterns, entities, configurations, and jobs from one place.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, status, or ID"
              aria-label="Search studio"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={!query.trim()} isLoading={loading}>
              <Search className="mr-1.5 h-4 w-4" />
              Search
            </Button>
            {!!submittedQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={() => runSearch(submittedQuery)}
                disabled={loading}
              >
                <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
                Retry
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="mt-6">
        {!submittedQuery && !loading && (
          <Card className="p-10">
            <PanelState
              icon={<Sparkles className="h-9 w-9 text-indigo-400" />}
              title="Try a search"
              description="Examples: customer_id, email, transformed, preset, payment"
            />
          </Card>
        )}

        {error && (
          <Card className="p-6">
            <PanelState
              icon={<AlertCircle className="h-8 w-8 text-red-400" />}
              title="Search failed"
              description={error}
              tone="error"
            />
          </Card>
        )}

        {!error && submittedQuery && !loading && results.length === 0 && (
          <Card className="p-10">
            <PanelState
              icon={<Search className="h-9 w-9 text-stone-300" />}
              title="No matches"
              description={`No results found for "${submittedQuery}".`}
            />
          </Card>
        )}

        {!error && results.length > 0 && (
          <div>
            <p className="mb-3 text-sm text-stone-500">
              {results.length} result{results.length !== 1 ? "s" : ""} for <span className="font-medium text-stone-700">{submittedQuery}</span>
            </p>
            <div className="space-y-2">
              {results.map((result) => (
                <Card key={result.id} className="flex items-center gap-4 p-4 hover:shadow-sm transition-shadow">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-stone-900">{result.title}</p>
                      <Badge className="border border-stone-200 bg-stone-50 text-stone-500 text-[10px]">
                        {result.kind}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-stone-500">{result.subtitle}</p>
                    <p className="mt-1 truncate text-[11px] text-stone-400">{result.id}</p>
                  </div>

                  {result.href ? (
                    <Link to={result.href} className="flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        Open section
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Badge className="flex-shrink-0 border border-stone-100 bg-stone-50 text-stone-400 text-[10px]">
                      Unmapped
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
