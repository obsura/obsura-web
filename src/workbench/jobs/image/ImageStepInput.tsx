import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, Trash2, ArrowRight, Camera, Image as ImageIcon } from "lucide-react";
import { Button, Card, PanelHeader } from "../../../components/common/UI";
import { api } from "../../../lib/api";
import { ConfigurationRead } from "../../../lib/types";

interface ImageStepInputProps {
  file: File | null;
  previewUrl: string | null;
  onChangeFile: (file: File | null, previewUrl: string | null) => void;
  configId: string | null;
  onChangeConfig: (val: string | null) => void;
  onNext: () => void;
  isProcessing: boolean;
}

export default function ImageStepInput({
  file,
  previewUrl,
  onChangeFile,
  configId,
  onChangeConfig,
  onNext,
  isProcessing
}: ImageStepInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [configs, setConfigs] = useState<ConfigurationRead[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFilesAdded = (files: File[]) => {
    const f = files[0];
    if (f) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(f);
      onChangeFile(f, url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) handleFilesAdded([blob]);
            break;
        }
    }
  };

  // Setup paste listener on document when this step is active
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
              const blob = items[i].getAsFile();
              if (blob) handleFilesAdded([blob]);
              break;
          }
      }
    };
    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, []);

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Main Input */}
        <div className="flex-1 space-y-4 flex flex-col">
          <PanelHeader
            title="Original Image"
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="w-4 h-4 mr-1.5" />
                  Upload
                </Button>
                {file && (
                  <Button variant="ghost" size="sm" onClick={() => onChangeFile(null, null)}>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Clear
                  </Button>
                )}
              </>
            }
          />
          <Card 
             className={`flex-1 min-h-[300px] relative flex flex-col items-center justify-center overflow-hidden transition-all
               ${!file ? "border-dashed bg-stone-50 hover:bg-stone-100 cursor-pointer" : "bg-stone-900"}
               ${isDragging ? "ring-2 ring-indigo-500 ring-offset-2 border-indigo-500 bg-indigo-50/50" : ""}
             `}
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
             onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected"
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-stone-500 space-y-3 pointer-events-none">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center text-stone-400">
                   <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-700">Click to upload or drag & drop</p>
                  <p className="text-xs mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                  <p className="text-xs mt-2 text-indigo-500 font-medium">Tip: You can also paste an image from your clipboard anywhere!</p>
                </div>
              </div>
            )}
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
                Choose a pre-saved configuration to apply specific detection rules (like faces or certain text) and custom transformations.
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
          disabled={isProcessing || !file}
          className="min-w-[120px]"
        >
          {isProcessing ? "Analyzing..." : "Analyze"}
          {!isProcessing && <ArrowRight className="w-4 h-4 ml-1.5" />}
        </Button>
      </div>
    </div>
  );
}