/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AppFooter, AppHero, AppWorkspace } from "../components/layout";
import { SegmentedControl } from "../components/common/UI";
import { RedactionMode } from "../lib/types";
import { Type, Image as ImageIcon } from "lucide-react";
import { useLocalStorage } from "../hooks/use-local-storage";
import React, { lazy, Suspense } from "react";
import { Header } from "../components/layout/Header";

const StudioLayout = lazy(() => import("../studio/StudioLayout.tsx"));
const WorkbenchLayout = lazy(() => import("../workbench/WorkbenchLayout.tsx"));

function QuickRedactPage({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const [searchParams] = useSearchParams();
  const defaultMode = (searchParams.get("mode") as RedactionMode) || "text";
  
  const [mode, setMode] = React.useState<RedactionMode>(defaultMode);
  
  const modeOptions = React.useMemo(
    () => [
      { value: "text" as const, label: "Text Redaction", icon: <Type className="w-4 h-4" /> },
      { value: "image" as const, label: "Image Redaction", icon: <ImageIcon className="w-4 h-4" /> },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header isDark={isDark} onToggleTheme={onToggleTheme} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <AppHero />
          <div className="flex justify-center flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold text-stone-800">Quick Redact</h2>
            <SegmentedControl value={mode} options={modeOptions} onChange={(v) => setMode(v)} />
          </div>
          <AppWorkspace mode={mode} />
          <AppFooter />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("obsura_theme", "light");
  const isDark = theme === "dark";

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = React.useCallback(() => setTheme(isDark ? "light" : "dark"), [isDark, setTheme]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/workbench/*" element={<WorkbenchLayout isDark={isDark} onToggleTheme={toggleTheme} />} />
        <Route path="/quick-redact" element={<QuickRedactPage isDark={isDark} onToggleTheme={toggleTheme} />} />
        <Route path="/studio/*" element={<StudioLayout isDark={isDark} onToggleTheme={toggleTheme} />} />
        <Route path="/" element={<Navigate to="/quick-redact?mode=text" replace />} />
        <Route path="*" element={<Navigate to="/quick-redact?mode=text" replace />} />
      </Routes>
    </Suspense>
  );
}
