/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from "../components/layout/Header";
import { TextMode } from "../components/text/TextMode";
import { ImageMode } from "../components/image/ImageMode";
import { DeveloperProfile } from "../components/layout/DeveloperProfile";
import { RedactionMode } from "../lib/types";
import { cn } from "../lib/utils";
import { Type, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocalStorage } from "../hooks/use-local-storage";
import React from "react";

export default function App() {
  const [mode, setMode] = useLocalStorage<RedactionMode>("obsura_active_mode", "text");
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("obsura_theme", "light");
  const isDark = theme === "dark";

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="app-shell min-h-screen text-primary font-sans selection:bg-sky-200/70 selection:text-slate-900 dark:selection:text-slate-950">
      <Header isDark={isDark} onToggleTheme={() => setTheme(isDark ? "light" : "dark")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 dark:bg-cyan-950/45 dark:text-cyan-200 dark:border-cyan-900 text-[10px] font-bold uppercase tracking-widest" aria-hidden="true">
              <ShieldCheck className="w-3 h-3" />
              Privacy First Redaction
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Redact sensitive PII in seconds.
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-base md:text-lg">
              Obsura helps you safely share documents and screenshots by automatically redacting PII, secrets, and sensitive information.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-elevated)] backdrop-blur-sm">
              <button
                onClick={() => setMode("text")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                  mode === "text"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <Type className="w-4 h-4" />
                Text Redaction
              </button>
              <button
                onClick={() => setMode("image")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                  mode === "image"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                Image Redaction
              </button>
            </div>
          </div>

          {/* Workspace */}
          <div className="surface rounded-2xl p-6 md:p-8 min-h-[500px]">
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

          {/* Footer Info */}
          <footer className="pt-6 pb-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-[var(--text-muted)]">
                &copy; 2026 Obsura Project. Created with &hearts; by <DeveloperProfile />.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</a>
                <a href="#" className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Security Audit</a>
                <a href="#" className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
