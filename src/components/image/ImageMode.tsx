/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Download, Trash2, Settings2, RefreshCw, Eye, EyeOff, AlertCircle, Monitor, Share2, ChevronLeft, ChevronRight, MessageCircle, Mail, MessageSquare } from "lucide-react";
import { Button, Card, Badge, CheckboxField, DisclosureToggle, FormField, MetaPill, PanelHeader, PanelState, Select, SettingsSection, StatusMeta, Textarea } from "../common/UI";
import { ImageAnalyzeManifest, ImageTransformManifest } from "../../lib/types";
import { downloadImageFile } from "../../lib/utils";
import { env } from "../../lib/env";
import { api } from "../../lib/api";
import { useImageRedaction } from "../../hooks/use-image-redaction";
import { useLocalStorage } from "../../hooks/use-local-storage";
import JSZip from "jszip";

export const ImageMode = () => {
  const [files, setFiles] = React.useState<{ id: string; file: File; previewUrl: string; resultImageUrl?: string }[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isBatchProcessing, setIsBatchProcessing] = React.useState(false);

  const activeFileObj = files[activeIndex];
  const file = activeFileObj?.file || null;
  const previewUrl = activeFileObj?.previewUrl || null;
  const [showAdvanced, setShowAdvanced] = useLocalStorage("obsura_img_showAdvanced", false);
  const [sliderPos, setSliderPos] = useState(0); // 0 shows the fully redacted image by default
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [autoProcess, setAutoProcess] = useLocalStorage("obsura_img_autoProcess", true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Options State
  const [detectText, setDetectText] = useLocalStorage("obsura_img_detectText", true);
  const [detectFaces, setDetectFaces] = useLocalStorage("obsura_img_detectFaces", false);
  const [transformMode, setTransformMode] = useLocalStorage<any>("obsura_img_transformMode", "blur");
  const [blurRadius, setBlurRadius] = useLocalStorage("obsura_img_blurRadius", 5);

  const { analysis, output, isLoading, error, analyzeImage, redactImage, reset: resetHook } = useImageRedaction();

  const resultImageUrl = React.useMemo(() => {
    // If we have an active file and it already has a saved result, use it preferentially when there's no live hook output.
    const activeSavedUrl = activeFileObj?.resultImageUrl;
    
    if (!output) return activeSavedUrl;
    if (output.media_url) {
      try {
        return new URL(output.media_url, env.API_BASE_URL).href;
      } catch {
        return output.media_url;
      }
    }
    return output.output_image_url || activeSavedUrl;
  }, [output, activeFileObj]);

  // Sync back resultImageUrl into the files array so we can download/share all
  React.useEffect(() => {
    if (output && resultImageUrl && activeFileObj && activeFileObj.resultImageUrl !== resultImageUrl) {
      setFiles(prev => {
        const next = [...prev];
        next[activeIndex] = { ...next[activeIndex], resultImageUrl };
        return next;
      });
    }
  }, [output, resultImageUrl, activeIndex]);

  const handleShare = async (platform?: string) => {
    if (!resultImageUrl) return;

    try {
      // First always prepare the image file blob to share actual bytes, not just a URL.
      const response = await fetch(resultImageUrl);
      const blob = await response.blob();
      const shareFile = new File([blob], 'redacted_image.png', { type: blob.type });

      // If user clicked any menu item (WhatsApp/Email/SMS or generic share)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          title: 'Redacted Image',
          text: 'Here is my securely redacted image from Obsura.',
          files: [shareFile] // This shares the actual image file across system intents
        });
        return; // Success! No need to fallback.
      }
      
      // Fallback for desktop browsers without File sharing intent capabilities (like older Chrome on Windows)
      const shareUrl = encodeURIComponent(window.location.origin + resultImageUrl);
      const text = encodeURIComponent('Check out my securely redacted image: ');
      
      if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${text}${shareUrl}`, '_blank');
      } else if (platform === 'email') {
        window.location.href = `mailto:?subject=Redacted Image&body=${text}${shareUrl}`;
      } else if (platform === 'sms') {
        window.location.href = `sms:?body=${text}${shareUrl}`;
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error("Share failed:", err);
    }
  };

  const getOrProcessAll = async () => {
    const manifest: ImageTransformManifest = {
      detect_text: detectText,
      detect_faces: detectFaces,
      default_transformation: {
        mode: transformMode,
        overlay_color: "#000000",
        blur_radius: Number(blurRadius),
      },
    };

    setIsBatchProcessing(true);
    const updatedFiles = await Promise.all(
      files.map(async (f) => {
        if (f.resultImageUrl) return f;
        try {
          const res = await api.transformImage(f.file, manifest);
          let url = res.output_image_url;
          if (res.media_url) {
            try {
              url = new URL(res.media_url, env.API_BASE_URL).href;
            } catch {
              url = res.media_url;
            }
          }
          return { ...f, resultImageUrl: url };
        } catch (err) {
          console.error("Failed to process", f.file.name, err);
          return f;
        }
      })
    );
    setFiles(updatedFiles);
    setIsBatchProcessing(false);
    return updatedFiles;
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    const processedFiles = await getOrProcessAll();
    const zip = new JSZip();

    for (let i = 0; i < processedFiles.length; i++) {
        const f = processedFiles[i];
        if (f.resultImageUrl) {
            try {
                const res = await fetch(f.resultImageUrl);
                const blob = await res.blob();
                zip.file(`redacted_${i + 1}_${f.file.name}`, blob);
            } catch (err) {
                console.error("Failed to fetch blob for zip", err);
            }
        }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const downloadUrl = URL.createObjectURL(content);
    downloadImageFile(downloadUrl, "obsura_redacted_images.zip");
    URL.revokeObjectURL(downloadUrl);
  };

  const handleShareAllWhatsApp = async () => {
    if (files.length === 0) return;
    const processedFiles = await getOrProcessAll();
    
    const filesToShare: File[] = [];
    for (let i = 0; i < processedFiles.length; i++) {
        const f = processedFiles[i];
        if (f.resultImageUrl) {
            try {
                const res = await fetch(f.resultImageUrl);
                const blob = await res.blob();
                filesToShare.push(new File([blob], `redacted_${i + 1}_${f.file.name}`, { type: blob.type }));
            } catch (err) {
                console.error("Failed to fetch blob for share", err);
            }
        }
    }

    if (filesToShare.length > 0 && navigator.share && navigator.canShare && navigator.canShare({ files: filesToShare })) {
        try {
            await navigator.share({
                title: 'Redacted Images',
                text: 'Check out my securely redacted images from Obsura.',
                files: filesToShare
            });
        } catch (err) {
            if ((err as Error).name !== 'AbortError') console.error("Share all failed:", err);
        }
    } else {
        alert("Your system doesn't support sharing multiple files directly to apps like WhatsApp.");
    }
  };
  const handleAnalyze = React.useCallback(() => {
    if (!file) return;
    const manifest: ImageAnalyzeManifest = {
      detect_text: detectText,
      detect_faces: detectFaces,
      apply_builtins: true,
    };
    analyzeImage(file, manifest);
  }, [file, detectText, detectFaces, analyzeImage]);

  const handleRedact = React.useCallback(() => {
    if (!file) return;
    const manifest: ImageTransformManifest = {
      detect_text: detectText,
      detect_faces: detectFaces,
      default_transformation: {
        mode: transformMode,
        overlay_color: "#111111",
        overlay_label: "REDACTED",
        blur_radius: Number(blurRadius),
      },
    };
    redactImage(file, manifest);
  }, [file, detectText, detectFaces, transformMode, blurRadius, redactImage]);

  // Auto-process effect
  React.useEffect(() => {
    if (autoProcess && file) {
      const handler = setTimeout(() => {
        handleRedact();
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [file, autoProcess, handleRedact]);

  const handleFilesAdded = React.useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;
    
    const fileObjs = validFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f)
    }));
    
    setFiles(prev => {
      const next = [...prev, ...fileObjs];
      if (prev.length === 0) {
        setActiveIndex(0);
        resetHook();
      }
      return next;
    });
  }, [resetHook]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "screenshot.png", { type: "image/png" });
            handleFilesAdded([capturedFile]);
          }
        }, "image/png");
      }
      
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Screen capture failed:", err);
    }
  };

  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const pastedFile = item.getAsFile();
          if (pastedFile) pastedFiles.push(pastedFile);
        }
      }
      if (pastedFiles.length > 0) handleFilesAdded(pastedFiles);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFilesAdded]);

  const handleReset = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setActiveIndex(0);
    resetHook();
  };

  // Keep a ref to the latest files to avoid stale closures on unmount
  const filesRef = React.useRef(files);
  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  React.useEffect(() => {
    return () => {
      filesRef.current.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-4">
          <PanelHeader
            title="Original image"
            titleId="original-image-label"
            actions={
              <>
              <Button variant="ghost" size="sm" onClick={handleScreenCapture} aria-label="Capture screen">
                <Monitor className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Capture
              </Button>
              {file && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Add more images" title="Add more images">
                    <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Add More
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset} aria-label="Clear all images" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Clear all">
                    <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Clear All
                  </Button>
                </>
              )}
              </>
            }
          />
          <Card
            className={`relative h-[360px] flex flex-col items-center justify-center transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 ${
              !file ? "border-dashed bg-stone-50/50 hover:bg-stone-100/50 cursor-pointer" : ""
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            role="region"
            aria-labelledby="original-image-label"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="sr-only"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              aria-label="Upload an image"
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Original uploaded"
                className="max-w-full max-h-full object-contain p-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center text-stone-400 space-y-4">
                <div className="p-4 bg-white rounded-full shadow-sm border border-stone-100 group-hover:scale-105 transition-transform duration-200">
                  <Upload className="w-8 h-8 text-indigo-500" aria-hidden="true" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-stone-600">Drag & drop, click, or Ctrl+V to paste</p>
                    <p className="text-xs mt-1 text-stone-400">Supports PNG, JPG, WebP up to 10MB or Screen Capture</p>
                </div>
              </div>
            )}
          </Card>
          {files.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 custom-scrollbar">
              {files.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => { setActiveIndex(i); resetHook(); }}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${i === activeIndex ? "border-indigo-500 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={f.previewUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[9px] px-1 rounded-tl-sm">{i + 1}</div>
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-stone-400 pl-1" aria-hidden="true">
            Images are processed securely. Results are not stored.
          </p>
        </div>

        {/* Output Column */}
        <div className="space-y-4">
          <PanelHeader
            title="Redacted output"
            titleId="redacted-image-label"
            actions={
              <>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={(!output && !activeFileObj?.resultImageUrl) || isBatchProcessing}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  aria-label="Share image"
                >
                  <Share2 className="w-4 h-4 mr-0 sm:mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                {showShareMenu && (output || activeFileObj?.resultImageUrl) && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-stone-200 shadow-md rounded-md flex flex-col p-1 z-50">
                    <button onClick={() => { handleShare('whatsapp'); setShowShareMenu(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-sm w-full text-left rounded-sm transition-colors text-stone-700">
                      <MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp (Current)
                    </button>
                    {files.length > 1 && (
                      <button onClick={() => { handleShareAllWhatsApp(); setShowShareMenu(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-sm w-full text-left rounded-sm transition-colors text-emerald-700 font-medium bg-emerald-50/50">
                        <MessageCircle className="w-4 h-4" /> WhatsApp All ({files.length})
                      </button>
                    )}
                    <button onClick={() => { handleShare('email'); setShowShareMenu(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-sm w-full text-left rounded-sm transition-colors">
                      <Mail className="w-4 h-4 text-stone-500" /> Email
                    </button>
                    <button onClick={() => { handleShare('sms'); setShowShareMenu(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-sm w-full text-left rounded-sm transition-colors">
                      <MessageSquare className="w-4 h-4 text-blue-500" /> SMS
                    </button>
                    {navigator.share && (
                      <button onClick={() => { handleShare(); setShowShareMenu(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-sm w-full text-left rounded-sm transition-colors border-t border-stone-100 mt-1 pt-2">
                        <Share2 className="w-4 h-4 text-stone-500" /> More options...
                      </button>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={(!output && !activeFileObj?.resultImageUrl) || isBatchProcessing}
                onClick={() => (output || activeFileObj?.resultImageUrl) && resultImageUrl && downloadImageFile(resultImageUrl, "redacted_image.png")}
                aria-label="Download redacted image"
                title="Download current"
              >
                <Download className="w-4 h-4 sm:mr-1.5" aria-hidden="true" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              {files.length > 1 && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isBatchProcessing}
                  onClick={handleDownloadAll}
                  aria-label="Download all as ZIP"
                  title={`Download all ${files.length} images compressed`}
                >
                  {isBatchProcessing ? (
                    <RefreshCw className="w-4 h-4 sm:mr-1.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="w-4 h-4 sm:mr-1.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {isBatchProcessing ? "Processing..." : "ZIP All"}
                  </span>
                </Button>
              )}
              </>
            }
          />
          <Card 
            className="bg-stone-50/50 h-[360px] flex items-center justify-center relative focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1"
            role="region"
            aria-labelledby="redacted-image-label"
          >
            {error ? (
              <PanelState
                role="alert"
                tone="error"
                icon={<AlertCircle className="w-8 h-8 opacity-50" />}
                description={error}
                className="max-w-[80%]"
              />
            ) : isLoading && !output && !analysis ? (
              <PanelState
                animated
                icon={<RefreshCw className="w-8 h-8 opacity-20 animate-spin" />}
                description="Processing image..."
                aria-live="polite"
              />
            ) : output ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 group">
                <img
                  src={resultImageUrl}
                  alt="Redacted"
                  className="absolute inset-4 object-contain pointer-events-none w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-w-full max-h-full"
                  referrerPolicy="no-referrer"
                />
                <img
                  src={previewUrl!}
                  alt="Original"
                  className="absolute inset-4 object-contain pointer-events-none w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-w-full max-h-full"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  referrerPolicy="no-referrer"
                />
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0"
                  aria-label="Compare before and after"
                />
                
                <div 
                  className="absolute top-4 bottom-4 w-[3px] bg-white shadow-[0_0_6px_rgba(0,0,0,0.24)] z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
                  style={{ left: `calc(1rem + (100% - 2rem) * ${sliderPos / 100})`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_1px_6px_rgba(0,0,0,0.22)] flex items-center justify-center border border-stone-200">
                    <div className="flex gap-0.5 text-stone-400">
                      <ChevronLeft className="w-4 h-4 -mr-1" />
                      <ChevronRight className="w-4 h-4 -ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ) : analysis ? (
              <PanelState
                icon={<ImageIcon className="w-8 h-8 opacity-20" />}
                title="Analysis complete"
                description={'Click "Redact image" to apply transformations'}
              />
            ) : (
              <PanelState
                icon={<ImageIcon className="w-8 h-8 opacity-20" />}
                description="Redacted image will appear here"
              />
            )}
          </Card>
          {analysis && !error && (
            <StatusMeta trailing={analysis.job_id ? <span title="Job ID">{analysis.job_id}</span> : undefined}>
              {analysis.summary && Object.entries(analysis.summary).map(([key, count]) => (
                <MetaPill key={key} tone="accent" className="capitalize">
                  {key.replace(/_/g, ' ')}: {count as React.ReactNode}
                </MetaPill>
              ))}
            </StatusMeta>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleAnalyze}
            isLoading={isLoading && !output}
            disabled={!file || isLoading}
            className="w-full sm:w-auto"
            aria-label="Analyze image for sensitive data"
          >
            Analyze image
          </Button>
          <Button
            onClick={handleRedact}
            isLoading={isLoading && !!analysis}
            disabled={!file || isLoading}
            className="w-full sm:w-auto px-8"
            aria-label="Redact image"
          >
            Redact image
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={isLoading} aria-label="Reset image workspace">
            Reset
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-4 sm:mt-0 gap-6">
          <CheckboxField
            label="Auto-redact on upload"
            checked={autoProcess}
            onChange={(e) => setAutoProcess(e.target.checked)}
            className="gap-2"
            inputClassName="focus:ring-offset-1 transition-all"
            labelClassName="text-xs font-medium text-stone-500 group-hover:text-stone-700"
          />
          <DisclosureToggle
            isOpen={showAdvanced}
            onToggle={() => setShowAdvanced(!showAdvanced)}
            label="Advanced options"
            icon={<Settings2 className="w-4 h-4" aria-hidden="true" />}
            controls="image-advanced-options"
          />
        </div>
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && (
        <Card id="image-advanced-options" className="p-5 mt-4 bg-stone-50 border-stone-200 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SettingsSection title="Detection">
              <div className="space-y-3">
                <CheckboxField
                  label="Detect text regions"
                  checked={detectText}
                  onChange={(e) => setDetectText(e.target.checked)}
                />
                <CheckboxField
                  label="Detect faces"
                  checked={detectFaces}
                  onChange={(e) => setDetectFaces(e.target.checked)}
                />
              </div>
            </SettingsSection>

            <SettingsSection title="Transformation">
              <FormField label="Mode">
                <Select
                  value={transformMode}
                  onChange={(e) => setTransformMode(e.target.value)}
                >
                  <option value="mask">Solid Mask</option>
                  <option value="blur">Blur</option>
                  <option value="pixelate">Pixelate</option>
                  <option value="overlay">Overlay Label</option>
                </Select>
              </FormField>
              {transformMode === "blur" && (
                <FormField label={`Blur Radius: ${blurRadius}px`} className="mt-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </FormField>
              )}
            </SettingsSection>

            <SettingsSection title="Manual Regions">
              <FormField label="Regions JSON (Advanced)">
                <Textarea
                  placeholder='[{"x": 10, "y": 10, "w": 100, "h": 50}]'
                  className="h-24 text-xs font-mono resize-none"
                />
              </FormField>
            </SettingsSection>
          </div>
        </Card>
      )}
    </div>
  );
};
