/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Github, BookOpen, Activity, CheckCircle2, Info, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "../common/UI";
import { useApiStatus } from "../../hooks/use-api-status";

export const Header = () => {
  const { health, version, loading, error, refetch } = useApiStatus();

  return (
    <header className="w-full border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 leading-none">Obsura</h1>
            <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider mt-0.5">
              Open-source sensitive data redaction
            </p>
          </div>
        </div>

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

          <div className="h-4 w-px bg-stone-200 hidden md:block" />

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-stone-500 hover:text-stone-900 transition-colors"
              title="Documentation"
            >
              <BookOpen className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/obsura"
              target="_blank"
              className="text-stone-500 hover:text-stone-900 transition-colors"
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
