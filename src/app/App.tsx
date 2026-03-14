/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Header } from "../components/layout/Header";
import { TextMode } from "../components/text/TextMode";
import { ImageMode } from "../components/image/ImageMode";
import { RedactionMode } from "../lib/types";
import { cn } from "../lib/utils";
import { Type, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [mode, setMode] = useState<RedactionMode>("text");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Privacy First Redaction
            </div>
            <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight">
              Protect sensitive data in seconds.
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto text-lg">
              Obsura helps you safely share documents and screenshots by automatically redacting PII, secrets, and sensitive information.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-stone-200/50 rounded-xl border border-stone-200">
              <button
                onClick={() => setMode("text")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                  mode === "text"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
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
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                Image Redaction
              </button>
            </div>
          </div>

          {/* Workspace */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/50 p-8 min-h-[600px]">
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
          <footer className="text-center space-y-6 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Zero Trust</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Data is processed in-memory. We never store your original content or redacted results on our servers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Open Source</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Built with transparency in mind. Audit the code, contribute, or host your own instance of Obsura.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Enterprise Ready</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  High-performance redaction engine supporting complex patterns, regex, and custom entity detection.
                </p>
              </div>
            </div>
            <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-stone-400">
                &copy; 2026 Obsura Project. Released under the Apache-2.0 License.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-[11px] font-medium text-stone-500 hover:text-stone-900">Privacy Policy</a>
                <a href="#" className="text-[11px] font-medium text-stone-500 hover:text-stone-900">Security Audit</a>
                <a href="#" className="text-[11px] font-medium text-stone-500 hover:text-stone-900">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
