/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Github, BookOpen, Activity, CheckCircle2, Info, RefreshCw, XCircle, MoonStar, SunMedium } from "lucide-react";
import { Badge } from "../common/UI";
import { useApiStatus } from "../../hooks/use-api-status";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header = ({ isDark, onToggleTheme }: HeaderProps) => {
  const { health, version, loading, error, refetch } = useApiStatus();

  return (
    <header className="w-full border-b border-[var(--line-subtle)] bg-[var(--bg-elevated)] backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#">
          <div className="flex items-center gap-3">
            <div className="rounded-lg flex items-center justify-center pointer-events-none select-none">
              <img src="/favicon.svg" alt="Obsura Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)] leading-none">Obsura</h1>
              <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">
                Open-source sensitive data redaction
              </p>
            </div>
          </div>
        </a>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <Badge variant="neutral" className="opacity-50 animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Checking API...
              </Badge>
            ) : error ? (
              <button onClick={refetch} className="hover:opacity-80 transition-opacity" title="Retry connection">
                <Badge variant="error" className="cursor-pointer">
                  <XCircle className="w-3 h-3 mr-1" />
                  API Offline
                </Badge>
              </button>
            ) : (
              <>
                <Badge variant={health?.status === "ok" ? "success" : "error"}>
                  <Activity className="w-3 h-3 mr-1" />
                  API: {health?.status || "Unknown"}
                </Badge>
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
                {version && (
                  <Badge variant="neutral">
                    <Info className="w-3 h-3 mr-1" />
                    v{version.version}
                  </Badge>
                )}
              </>
            )}
          </div>

          <div className="h-4 w-px bg-[var(--line-subtle)] hidden md:block" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className="h-9 w-9 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <SunMedium className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
            </button>
            <a
              href="#"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Documentation"
            >
              <BookOpen className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/obsura"
              target="_blank"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
