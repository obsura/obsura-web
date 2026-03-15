/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { AppFooter, AppHero, AppWorkspace, Header } from "../components/layout";
import { SegmentedControl } from "../components/common/UI";
import { RedactionMode } from "../lib/types";
import { Type, Image as ImageIcon } from "lucide-react";
import { useLocalStorage } from "../hooks/use-local-storage";
import React, { lazy, Suspense } from "react";

const StudioLayout = lazy(() => import("../studio/StudioLayout"));

function HomePage({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const [mode, setMode] = useLocalStorage<RedactionMode>("obsura_active_mode", "text");
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
          <div className="flex justify-center">
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
        <Route path="/" element={<HomePage isDark={isDark} onToggleTheme={toggleTheme} />} />
        <Route path="/studio/*" element={<StudioLayout isDark={isDark} onToggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
