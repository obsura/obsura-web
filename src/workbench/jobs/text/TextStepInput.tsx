import React, { useState, useEffect } from "react";
import { ClipboardPaste, Trash2, ArrowRight } from "lucide-react";
import { Button, Card, PanelHeader } from "../../../components/common/UI";
import { api } from "../../../lib/api";
import { ConfigurationRead } from "../../../lib/types";

interface TextStepInputProps {
  text: string;
  onChangeText: (val: string) => void;
  configId: string | null;
  onChangeConfig: (val: string | null) => void;
  onNext: () => void;
  isProcessing: boolean;
}

export default function TextStepInput({
  text,
  onChangeText,
  configId,
  onChangeConfig,
  onNext,
  isProcessing
}: TextStepInputProps) {
  const [configs, setConfigs] = useState<ConfigurationRead[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  useEffect(() => {
    async function loadConfigs() {
      try {
        setIsLoadingConfigs(true);
        const res = await api.listConfigurations({ page: 1, page_size: 50 });
        setConfigs(res.data);
      } catch (err) {
        console.error("Failed to load configs", err);
      } finally {
        setIsLoadingConfigs(false);
      }
    }
    loadConfigs();
  }, []);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      onChangeText(clipboardText);
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Main Input */}
        <div className="flex-1 space-y-4 flex flex-col">
          <PanelHeader
            title="Original Text"
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={handlePaste}>
                  <ClipboardPaste className="w-4 h-4 mr-1.5" />
                  Paste
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onChangeText("")}>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Clear
                </Button>
              </>
            }
          />
          <Card className="flex-1 min-h-[300px] relative focus-within:ring-2 focus-within:ring-indigo-500">
            <textarea
              className="w-full h-full resize-none border-none bg-transparent p-5 font-mono text-sm leading-relaxed text-stone-800 outline-none placeholder:text-stone-400"
              placeholder="Paste sensitive text, logs, emails, or PII here..."
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
            />
            <div className="absolute bottom-3 right-4 select-none font-mono text-[10px] text-stone-400">
              {text.length} characters
            </div>
          </Card>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full lg:w-72 space-y-4 flex flex-col">
          <PanelHeader title="Settings" />
          
          <div className="flex-1 bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-stone-900 block">
                Configuration Recipe
              </label>
              <p className="text-xs text-stone-500 leading-relaxed">
                Choose a pre-saved configuration to apply specific detection rules and custom transformations.
              </p>
              
              <div className="relative">
                <select
                  disabled={isLoadingConfigs}
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                  value={configId || ""}
                  onChange={(e) => onChangeConfig(e.target.value || null)}
                >
                  <option value="">None (Use default built-ins)</option>
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex justify-end items-center border-t border-stone-100 pt-6">
        <Button 
          variant="primary" 
          onClick={onNext} 
          disabled={isProcessing || !text.trim()}
          className="min-w-[120px]"
        >
          {isProcessing ? "Analyzing..." : "Analyze"}
          {!isProcessing && <ArrowRight className="w-4 h-4 ml-1.5" />}
        </Button>
      </div>
    </div>
  );
}