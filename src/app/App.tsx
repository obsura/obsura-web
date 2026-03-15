/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/use-local-storage";
import React, { lazy, Suspense } from "react";

const StudioLayout = lazy(() => import("../studio/StudioLayout.tsx"));
const WorkbenchLayout = lazy(() => import("../workbench/WorkbenchLayout.tsx"));

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
        <Route path="/studio/*" element={<StudioLayout isDark={isDark} onToggleTheme={toggleTheme} />} />
        <Route path="/" element={<Navigate to="/workbench" replace />} />
        <Route path="*" element={<Navigate to="/workbench" replace />} />
      </Routes>
    </Suspense>
  );
}
