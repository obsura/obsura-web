import React from "react";
import { FlaskConical, Building2, Settings2, History, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/common/UI";
import { cn } from "../lib/utils";

interface StatCard {
  label: string;
  description: string;
  icon: React.ReactNode;
  count: number | null;
  loading: boolean;
  href: string;
  color: string;
}

function StatTile({ label, description, icon, count, loading, href, color }: StatCard) {
  return (
    <Link to={href} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
      <Card className="h-full p-5 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
            {icon}
          </div>
          <ArrowRight className="h-4 w-4 text-stone-300 transition-colors group-hover:text-indigo-400" />
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <span className="h-7 w-10 animate-pulse rounded bg-stone-100 inline-block" />
            ) : (
              <span className="text-2xl font-semibold text-stone-900">{count ?? "—"}</span>
            )}
          </div>
          <p className="mt-0.5 text-sm font-medium text-stone-700">{label}</p>
          <p className="mt-1 text-xs text-stone-400">{description}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function StudioHome() {
  const [counts, setCounts] = React.useState<Record<string, number | null>>({
    patterns: null,
    entities: null,
    configurations: null,
    jobs: null,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchCounts() {
      try {
        const [patterns, entities, configurations, jobs] = await Promise.allSettled([
          api.listPatterns({ page: 1, page_size: 1 }, controller.signal),
          api.listEntities({ page: 1, page_size: 1 }, controller.signal),
          api.listConfigurations({ page: 1, page_size: 1 }, controller.signal),
          api.listJobs({ page: 1, page_size: 1 }, controller.signal),
        ]);

        setCounts({
          patterns: patterns.status === "fulfilled" ? patterns.value.pagination.total_items : null,
          entities: entities.status === "fulfilled" ? entities.value.pagination.total_items : null,
          configurations: configurations.status === "fulfilled" ? configurations.value.pagination.total_items : null,
          jobs: jobs.status === "fulfilled" ? jobs.value.pagination.total_items : null,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
    return () => controller.abort();
  }, []);

  const tiles: StatCard[] = [
    {
      label: "Search",
      description: "Find records across Studio resources from one place",
      icon: <Search className="h-5 w-5 text-indigo-600" />,
      count: null,
      loading: false,
      href: "/studio/search",
      color: "bg-indigo-50",
    },
    {
      label: "Patterns",
      description: "Regex, exact match and list matchers with redaction transformations",
      icon: <FlaskConical className="h-5 w-5 text-violet-600" />,
      count: counts.patterns,
      loading,
      href: "/studio/patterns",
      color: "bg-violet-50",
    },
    {
      label: "Custom Entities",
      description: "Named entity definitions with one or more detection rules",
      icon: <Building2 className="h-5 w-5 text-blue-600" />,
      count: counts.entities,
      loading,
      href: "/studio/entities",
      color: "bg-blue-50",
    },
    {
      label: "Configurations",
      description: "Packs, profiles and presets bundling patterns and entities",
      icon: <Settings2 className="h-5 w-5 text-amber-600" />,
      count: counts.configurations,
      loading,
      href: "/studio/configurations",
      color: "bg-amber-50",
    },
    {
      label: "Job History",
      description: "Redaction jobs with findings, review status and outputs",
      icon: <History className="h-5 w-5 text-emerald-600" />,
      count: counts.jobs,
      loading,
      href: "/studio/jobs",
      color: "bg-emerald-50",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-stone-900">Studio Overview</h1>
        <p className="mt-1 text-sm text-stone-500">
          Manage detection rules, entity definitions, configurations and review redaction jobs.
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.href} {...tile} />
        ))}
      </div>

      {/* Quick-start hint */}
      <div className="mt-10 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-6 text-center">
        <p className="text-sm font-medium text-stone-600">Getting started</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-stone-400">
          Create <strong className="font-medium text-stone-500">Patterns</strong> to define what to detect, group them into{" "}
          <strong className="font-medium text-stone-500">Configurations</strong>, then run redaction jobs from the main app.
          Jobs will appear in <strong className="font-medium text-stone-500">Job History</strong> for review.
        </p>
      </div>
    </div>
  );
}
