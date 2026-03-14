/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from "react";
import { Copy, Download, Trash2, ClipboardPaste, Settings2, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button, Card, Badge } from "../common/UI";
import { TextAnalyzeTransformRequest } from "../../lib/types";
import { downloadTextFile } from "../../lib/utils";
import { useTextRedaction } from "../../hooks/use-text-redaction";

export const TextMode = () => {
  const [input, setInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [redactOnInput, setRedactOnInput] = useState(false);

  // Advanced Options State
  const [applyBuiltins, setApplyBuiltins] = useState(true);
  const [persistJob, setPersistJob] = useState(false);
  const [transformationMode, setTransformationMode] = useState<any>("semantic");
  const [exactValues, setExactValues] = useState("");
  const [placeholderLabel, setPlaceholderLabel] = useState("SENSITIVE_VALUE");

  const { output, isLoading, error, redactText, reset } = useTextRedaction();

  const handleRedact = useCallback(() => {
    if (!input.trim()) return;
    const payload: TextAnalyzeTransformRequest = {
      content: input,
      apply_builtins: applyBuiltins,
      persist_job: persistJob,
      exact_values: exactValues.split(",").map(v => v.trim()).filter(Boolean),
      default_transformation: {
        mode: transformationMode,
        semantic_label: placeholderLabel,
      },
    };
    redactText(payload);
  }, [input, applyBuiltins, persistJob, exactValues, transformationMode, placeholderLabel, redactText]);

  // Debounced execution for Redact on input
  useEffect(() => {
    if (redactOnInput && input.trim()) {
      const handler = setTimeout(() => {
        handleRedact();
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [input, redactOnInput, handleRedact]);

  const handleReset = () => {
    setInput("");
    reset();
  };

  const handleCopy = useCallback(() => {
    if (output?.output_text) {
      navigator.clipboard.writeText(output.output_text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [output]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Original text</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handlePaste} title="Paste from clipboard">
                <ClipboardPaste className="w-4 h-4 mr-1.5" />
                Paste
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} title="Clear text">
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear
              </Button>
            </div>
          </div>
          <Card className="relative">
            <textarea
              className="w-full h-[400px] p-4 text-sm font-mono bg-transparent border-none focus:ring-0 resize-none placeholder:text-stone-400"
              placeholder="Paste sensitive text here (e.g. logs, emails, documents)..."
              value={input}
              onChange={handleInputChange}
            />
            <div className="absolute bottom-3 right-4 text-[10px] font-mono text-stone-400">
              {input.length} characters
            </div>
          </Card>
          <p className="text-[11px] text-stone-500 italic">
            Your data is processed locally or via a secure API. No data is stored by default.
          </p>
        </div>

        {/* Output Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Redacted result</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4 mr-1.5" />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={() => output && downloadTextFile(output.output_text, "redacted.txt")}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          <Card className="bg-stone-50/50">
            <div className="w-full h-[400px] p-4 text-sm font-mono overflow-auto whitespace-pre-wrap text-stone-800">
              {error ? (
                <div role="alert" className="h-full flex flex-col items-center justify-center text-red-500 space-y-2">
                  <AlertCircle className="w-8 h-8 opacity-50" />
                  <p className="text-xs text-center max-w-sm">{error}</p>
                </div>
              ) : isLoading && !output ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2 animate-pulse">
                  <RefreshCw className="w-8 h-8 opacity-20 animate-spin" />
                  <p className="text-xs" aria-live="polite">Analyzing and redacting...</p>
                </div>
              ) : output ? (
                <span aria-live="polite">{output.output_text}</span>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                  <RefreshCw className="w-8 h-8 opacity-20" />
                  <p className="text-xs">Redacted text will appear here</p>
                </div>
              )}
            </div>
          </Card>
          {output && !error && (
            <div className="flex flex-wrap items-center gap-2 mt-2" aria-live="polite">
              {output.summary && Object.entries(output.summary).map(([key, count]) => (
                <Badge key={key} variant="indigo">
                  {key}: {count as React.ReactNode}
                </Badge>
              ))}
              {typeof output.replacements?.length === "number" && (
                <Badge variant="neutral">
                  Replacements: {output.replacements.length}
                </Badge>
              )}
              {output.job_id && (
                <div className="ml-auto text-[10px] font-mono text-stone-400">
                  Job ID: {output.job_id}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRedact}
            isLoading={isLoading}
            disabled={!input.trim()}
            className="w-full sm:w-auto px-8"
          >
            Redact text
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={redactOnInput}
              onChange={(e) => setRedactOnInput(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-700">Redact on input</span>
          </label>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Advanced options
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && (
        <Card className="p-6 bg-stone-50/30 border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Detection</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={applyBuiltins}
                  onChange={(e) => setApplyBuiltins(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-stone-700 group-hover:text-stone-900">Use built-in detectors</span>
              </label>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-600">Exact values to redact</label>
                <input
                  type="text"
                  placeholder="Comma separated values..."
                  value={exactValues}
                  onChange={(e) => setExactValues(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Transformation</h4>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-600">Mode</label>
                <select
                  value={transformationMode}
                  onChange={(e) => setTransformationMode(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="semantic">Semantic Label</option>
                  <option value="mask">Full Mask</option>
                  <option value="partial_mask">Partial Mask</option>
                  <option value="stable_alias">Stable Alias</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-600">Placeholder Label</label>
                <input
                  type="text"
                  value={placeholderLabel}
                  onChange={(e) => setPlaceholderLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Persistence</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={persistJob}
                  onChange={(e) => setPersistJob(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-stone-700 group-hover:text-stone-900">Persist job metadata</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-stone-700">Persist source content (Disabled)</span>
              </label>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
