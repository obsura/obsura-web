/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from "../components/layout/Header";
import { AppFooter } from "../components/layout/AppFooter";
import { TextMode } from "../components/text/TextMode";
import { ImageMode } from "../components/image/ImageMode";
import { SegmentedControl } from "../components/common/UI";
import { RedactionMode } from "../lib/types";
import { Type, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest" aria-hidden="true">
              <ShieldCheck className="w-3 h-3" />
              Privacy First Redaction
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Reduct sensitive PII in seconds.
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto text-base md:text-lg">
              Obsura helps you safely share documents and screenshots by automatically redacting PII, secrets, and sensitive information.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center">
            <SegmentedControl value={mode} options={modeOptions} onChange={setMode} />
          </div>

          {/* Workspace */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-md shadow-stone-200/30 dark:shadow-black/25 p-6 md:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "text" ? <TextMode /> : <ImageMode />}
              </motion.div>
            </AnimatePresence>
          </div>

          <AppFooter />
        </div>
      </main>
    </div>
  );
}
