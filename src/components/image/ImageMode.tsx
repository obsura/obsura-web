/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Download, Trash2, Settings2, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button, Card, Badge } from "../common/UI";
import { ImageAnalyzeManifest, ImageTransformManifest } from "../../lib/types";
import { downloadImageFile } from "../../lib/utils";
import { useImageRedaction } from "../../hooks/use-image-redaction";

export const ImageMode = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Options State
  const [detectText, setDetectText] = useState(true);
  const [detectFaces, setDetectFaces] = useState(false);
  const [transformMode, setTransformMode] = useState<any>("mask");
  const [blurRadius, setBlurRadius] = useState(20);

  const { analysis, output, isLoading, error, analyzeImage, redactImage, reset: resetHook } = useImageRedaction();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      resetHook();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      resetHook();
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    const manifest: ImageAnalyzeManifest = {
      detect_text: detectText,
      detect_faces: detectFaces,
      apply_builtins: true,
    };
    analyzeImage(file, manifest);
  };

  const handleRedact = () => {
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
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    resetHook();
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Original image</h3>
            {file && (
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} title="Replace image">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Replace
              </Button>
            )}
          </div>
          <Card
            className={`relative h-[400px] flex flex-col items-center justify-center transition-all ${
              !file ? "border-dashed bg-stone-50/50 hover:bg-stone-100/50 cursor-pointer" : ""
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain p-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center text-stone-400 space-y-4">
                <div className="p-4 bg-white rounded-full shadow-sm border border-stone-100">
                  <Upload className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-600">Drag & drop or click to browse</p>
                  <p className="text-xs mt-1">Supports PNG, JPG, WebP up to 10MB</p>
                </div>
              </div>
            )}
          </Card>
          <p className="text-[11px] text-stone-500 italic">
            Images are processed securely. Redaction happens on the server and results are returned to you.
          </p>
        </div>

        {/* Output Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Redacted output</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={() => setShowOriginal(!showOriginal)}
                title={showOriginal ? "Show redacted" : "Show original"}
              >
                {showOriginal ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
                {showOriginal ? "Hide original" : "Compare"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={() => output && downloadImageFile(output.output_image_url, "redacted_image.png")}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          <Card className="bg-stone-50/50 h-[400px] flex items-center justify-center relative">
            {error ? (
              <div role="alert" className="flex flex-col items-center justify-center text-red-500 space-y-2 p-4 text-center">
                <AlertCircle className="w-8 h-8 opacity-50" />
                <p className="text-xs max-w-[80%]">{error}</p>
              </div>
            ) : isLoading && !output && !analysis ? (
              <div className="flex flex-col items-center justify-center text-stone-400 space-y-2 animate-pulse">
                <RefreshCw className="w-8 h-8 opacity-20 animate-spin" />
                <p className="text-xs" aria-live="polite">Processing image...</p>
              </div>
            ) : output ? (
              <img
                src={showOriginal ? previewUrl! : output.output_image_url}
                alt="Redacted"
                className="max-w-full max-h-full object-contain p-4"
                referrerPolicy="no-referrer"
              />
            ) : analysis ? (
              <div className="flex flex-col items-center justify-center text-stone-400 space-y-2">
                <ImageIcon className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium text-stone-600">Analysis complete</p>
                <p className="text-xs">Click "Redact image" to apply transformations</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400 space-y-2">
                <ImageIcon className="w-8 h-8 opacity-20" />
                <p className="text-xs">Redacted image will appear here</p>
              </div>
            )}
            {output && showOriginal && (
              <div className="absolute top-4 right-4">
                <Badge variant="warning">Original View</Badge>
              </div>
            )}
          </Card>
          {analysis && !error && (
            <div className="flex flex-wrap items-center gap-2" aria-live="polite">
              {analysis.summary && Object.entries(analysis.summary).map(([key, count]) => (
                <Badge key={key} variant="indigo">
                  {key}: {count as React.ReactNode}
                </Badge>
              ))}
              {analysis.job_id && (
                <div className="ml-auto text-[10px] font-mono text-stone-400">
                  Job ID: {analysis.job_id}
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
            variant="outline"
            onClick={handleAnalyze}
            isLoading={isLoading}
            disabled={!file || isLoading}
            className="w-full sm:w-auto"
          >
            Analyze image
          </Button>
          <Button
            onClick={handleRedact}
            isLoading={isLoading}
            disabled={!file || isLoading}
            className="w-full sm:w-auto px-8"
          >
            Redact image
          </Button>
          <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-4">
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
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={detectText}
                    onChange={(e) => setDetectText(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-stone-700 group-hover:text-stone-900">Detect text regions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={detectFaces}
                    onChange={(e) => setDetectFaces(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-stone-700 group-hover:text-stone-900">Detect faces</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Transformation</h4>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-600">Mode</label>
                <select
                  value={transformMode}
                  onChange={(e) => setTransformMode(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="mask">Solid Mask</option>
                  <option value="blur">Blur</option>
                  <option value="pixelate">Pixelate</option>
                  <option value="overlay">Overlay Label</option>
                </select>
              </div>
              {transformMode === "blur" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-600">Blur Radius: {blurRadius}px</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Manual Regions</h4>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-600">Regions JSON (Advanced)</label>
                <textarea
                  placeholder='[{"x": 10, "y": 10, "w": 100, "h": 50}]'
                  className="w-full h-24 px-3 py-1.5 text-[10px] font-mono rounded-lg border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
