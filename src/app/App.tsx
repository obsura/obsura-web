/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppFooter, AppHero, AppWorkspace, Header } from "../components/layout";
import { SegmentedControl } from "../components/common/UI";
import { RedactionMode } from "../lib/types";
import { Type, Image as ImageIcon } from "lucide-react";
import { useLocalStorage } from "../hooks/use-local-storage";
import React from "react";

export default function App() {
  const [mode, setMode] = useLocalStorage<RedactionMode>("obsura_active_mode", "text");
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("obsura_theme", "light");
  const isDark = theme === "dark";
  const modeOptions = React.useMemo(
    () => [
      { value: "text" as const, label: "Text Redaction", icon: <Type className="w-4 h-4" /> },
      { value: "image" as const, label: "Image Redaction", icon: <ImageIcon className="w-4 h-4" /> },
    ],
    []
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header isDark={isDark} onToggleTheme={() => setTheme(isDark ? "light" : "dark")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <AppHero />

          {/* Mode Switcher */}
          <div className="flex justify-center">
            <SegmentedControl value={mode} options={modeOptions} onChange={setMode} />
          </div>

          <AppWorkspace mode={mode} />

          <AppFooter />
        </div>
      </main>
    </div>
  );
}
