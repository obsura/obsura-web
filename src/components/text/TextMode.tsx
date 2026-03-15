/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from "react";
import { Copy, Download, Trash2, ClipboardPaste, RefreshCw, AlertCircle } from "lucide-react";
import { Button, Card, CheckboxField, MetaPill, PanelHeader, PanelState, StatusMeta } from "../common/UI";
import { TextAnalyzeTransformRequest } from "../../lib/types";
import { downloadTextFile } from "../../lib/utils";
import { useTextRedaction } from "../../hooks/use-text-redaction";
import { useLocalStorage } from "../../hooks/use-local-storage";

export const TextMode = () => {
  const [input, setInput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [redactOnInput, setRedactOnInput] = useLocalStorage("obsura_text_redactOnInput", true);

  const { output, isLoading, error, redactText, reset } = useTextRedaction();

  const handleRedact = useCallback(() => {
    if (!input.trim()) return;

    const payload: TextAnalyzeTransformRequest = {
      content: input,
      apply_builtins: false,
      persist_job: false,
      exact_values: [],
      default_transformation: {
        mode: "semantic",
        semantic_label: "SENSITIVE_VALUE",
      },
    };

    redactText(payload);
  }, [input, redactText]);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <PanelHeader
            title="Original text"
            titleId="original-text-label"
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={handlePaste} aria-label="Paste from clipboard">
                  <ClipboardPaste className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Paste
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setInput("")} aria-label="Clear original text">
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Clear
                </Button>
              </>
            }
          />

          <Card className="relative transition-shadow focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1">
            <textarea
              aria-labelledby="original-text-label"
              className="h-[360px] w-full resize-none border-none bg-transparent p-5 font-mono text-sm leading-relaxed text-stone-800 outline-none placeholder:text-stone-400/70 focus:outline-none focus:ring-0"
              placeholder="Paste sensitive text here (e.g. logs, emails, documents)..."
              value={input}
              onChange={handleInputChange}
            />
            <div className="pointer-events-none absolute bottom-3 right-4 select-none font-mono text-[10px] text-stone-400/80">
              {input.length} characters
            </div>
          </Card>

          <p className="text-[11px] text-stone-500" aria-hidden="true">
            Data is processed securely. Results are not stored.
          </p>
        </div>

        <div className="space-y-4">
          <PanelHeader
            title="Redacted result"
            titleId="redacted-result-label"
            actions={
              <>
                <Button variant="ghost" size="sm" disabled={!output} onClick={handleCopy} aria-label="Copy redacted text">
                  <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {copySuccess ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!output}
                  onClick={() => output && downloadTextFile(output.output_text, "redacted.txt")}
                  aria-label="Download redacted text"
                >
                  <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Download
                </Button>
              </>
            }
          />

          <Card className="bg-stone-50/50">
            <div
              className="h-[360px] w-full overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed text-stone-800"
              role="region"
              aria-labelledby="redacted-result-label"
              tabIndex={0}
            >
              {error ? (
                <PanelState
                  role="alert"
                  tone="error"
                  icon={<AlertCircle className="h-8 w-8 opacity-50" />}
                  description={error}
                />
              ) : isLoading && !output ? (
                <PanelState
                  animated
                  icon={<RefreshCw className="h-8 w-8 animate-spin opacity-20" />}
                  description="Analyzing and redacting..."
                  aria-live="polite"
                />
              ) : output ? (
                <span aria-live="polite">{output.output_text}</span>
              ) : (
                <PanelState
                  icon={<RefreshCw className="h-8 w-8 opacity-20" />}
                  description="Redacted text will appear here"
                />
              )}
            </div>
          </Card>

          {output && !error && (
            <StatusMeta trailing={output.job_id ? <span title="Job ID">{output.job_id}</span> : undefined}>
              {output.summary?.replacement_count !== undefined ? (
                <MetaPill tone="accent">
                  {output.summary.replacement_count} replacement{output.summary.replacement_count !== 1 && "s"}
                </MetaPill>
              ) : output.replacements?.length > 0 ? (
                <MetaPill>
                  {output.replacements.length} replacement{output.replacements.length !== 1 && "s"}
                </MetaPill>
              ) : null}
            </StatusMeta>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-100 pt-4 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button
            onClick={handleRedact}
            isLoading={isLoading}
            disabled={!input.trim()}
            className="w-full px-8 sm:w-auto"
            aria-label="Start text redaction"
          >
            Redact text
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={isLoading} aria-label="Reset text mode workspace">
            Reset
          </Button>
        </div>

        <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-end">
          <CheckboxField
            label="Redact on input"
            checked={redactOnInput}
            onChange={(event) => setRedactOnInput(event.target.checked)}
            className="gap-2"
            inputClassName="focus:ring-offset-1 transition-all"
            labelClassName="text-xs font-medium text-stone-500 group-hover:text-stone-700"
          />
        </div>
      </div>
    </div>
  );
};
