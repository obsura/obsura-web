/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from "react";
import { Copy, Download, Trash2, ClipboardPaste, Settings2, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button, Card, Checkbox, FormField, Input, MetaPill, PanelHeader, Select, StatusMeta } from "../common/UI";
import { TextAnalyzeTransformRequest } from "../../lib/types";
import { downloadTextFile } from "../../lib/utils";
import { useTextRedaction } from "../../hooks/use-text-redaction";
import { useLocalStorage } from "../../hooks/use-local-storage";

export const TextMode = () => {
  const [input, setInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useLocalStorage("obsura_text_showAdvanced", false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [redactOnInput, setRedactOnInput] = useLocalStorage("obsura_text_redactOnInput", true);

  // Advanced Options State
  const [applyBuiltins, setApplyBuiltins] = useLocalStorage("obsura_text_applyBuiltins", true);
  const [persistJob, setPersistJob] = useLocalStorage("obsura_text_persistJob", false);
  const [transformationMode, setTransformationMode] = useLocalStorage<any>("obsura_text_transformationMode", "semantic");
  const [exactValues, setExactValues] = useLocalStorage("obsura_text_exactValues", "");
  const [placeholderLabel, setPlaceholderLabel] = useLocalStorage("obsura_text_placeholderLabel", "SENSITIVE_VALUE");

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
          <PanelHeader
            title="Original text"
            titleId="original-text-label"
            actions={
              <>
              <Button variant="ghost" size="sm" onClick={handlePaste} aria-label="Paste from clipboard">
                <ClipboardPaste className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Paste
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} aria-label="Clear original text">
                <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Clear
              </Button>
              </>
            }
          />
          <Card className="relative focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 transition-shadow">
            <textarea
              aria-labelledby="original-text-label"
              className="w-full h-[360px] p-5 text-sm leading-relaxed font-mono bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none placeholder:text-stone-400/70 text-stone-800"
              placeholder="Paste sensitive text here (e.g. logs, emails, documents)..."
              value={input}
              onChange={handleInputChange}
            />
            <div className="absolute bottom-3 right-4 text-[10px] font-mono text-stone-400/80 pointer-events-none select-none">
              {input.length} characters
            </div>
          </Card>
          <p className="text-[11px] text-stone-500" aria-hidden="true">
            Data is processed securely. Results are not stored.
          </p>
        </div>

        {/* Output Column */}
        <div className="space-y-4">
          <PanelHeader
            title="Redacted result"
            titleId="redacted-result-label"
            actions={
              <>
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={handleCopy}
                aria-label="Copy redacted text"
              >
                <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={() => output && downloadTextFile(output.output_text, "redacted.txt")}
                aria-label="Download redacted text"
              >
                <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Download
              </Button>
              </>
            }
          />
          <Card className="bg-stone-50/50">
            <div 
              className="w-full h-[360px] p-5 text-sm leading-relaxed font-mono overflow-auto whitespace-pre-wrap text-stone-800"
              role="region"
              aria-labelledby="redacted-result-label"
              tabIndex={0}
            >
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
            <StatusMeta trailing={output.job_id ? <span title="Job ID">{output.job_id}</span> : undefined}>
              {output.summary?.replacement_count !== undefined ? (
                <MetaPill tone="accent">
                  {output.summary.replacement_count} replacement{output.summary.replacement_count !== 1 && 's'}
                </MetaPill>
              ) : output.replacements?.length > 0 ? (
                <MetaPill>
                  {output.replacements.length} replacement{output.replacements.length !== 1 && 's'}
                </MetaPill>
              ) : null}
            </StatusMeta>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleRedact}
            isLoading={isLoading}
            disabled={!input.trim()}
            className="w-full sm:w-auto px-8"
            aria-label="Start text redaction"
          >
            Redact text
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={isLoading} aria-label="Reset text mode workspace">
            Reset
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={redactOnInput}
              onChange={(e) => setRedactOnInput(e.target.checked)}
              className="focus:ring-offset-1 transition-all"
            />
            <span className="text-xs font-medium text-stone-500 group-hover:text-stone-700 transition-colors">Redact on input</span>
          </label>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 px-1"
            aria-expanded={showAdvanced}
            aria-controls="advanced-options-panel"
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            Advanced options
            {showAdvanced ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && (
        <Card id="advanced-options-panel" className="p-5 mt-4 bg-stone-50 border-stone-200 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Detection</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={applyBuiltins}
                  onChange={(e) => setApplyBuiltins(e.target.checked)}
                />
                <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">Use built-in detectors</span>
              </label>
              <FormField label="Exact values to redact" className="mt-2">
                <Input
                  placeholder="Comma separated..."
                  value={exactValues}
                  onChange={(e) => setExactValues(e.target.value)}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transformation</h4>
              <FormField label="Mode">
                <Select
                  value={transformationMode}
                  onChange={(e) => setTransformationMode(e.target.value)}
                >
                  <option value="semantic">Semantic Label</option>
                  <option value="mask">Full Mask</option>
                  <option value="partial_mask">Partial Mask</option>
                  <option value="stable_alias">Stable Alias</option>
                </Select>
              </FormField>
              <FormField label="Placeholder Label" className="mt-2">
                <Input
                  value={placeholderLabel}
                  onChange={(e) => setPlaceholderLabel(e.target.value)}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Persistence</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={persistJob}
                  onChange={(e) => setPersistJob(e.target.checked)}
                />
                <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">Persist job metadata</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                <Checkbox
                  disabled
                />
                <span className="text-sm text-stone-500 line-through decoration-stone-300">Persist source content</span>
              </label>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
