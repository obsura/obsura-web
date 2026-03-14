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
            <h3 className="text-sm font-semibold text-stone-900" id="original-image-label">Original image</h3>
            {file && (
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Replace image">
                <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Replace
              </Button>
            )}
          </div>
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
                  <p className="text-sm font-medium text-stone-600">Drag & drop or click to browse</p>
                  <p className="text-xs mt-1 text-stone-400">Supports PNG, JPG, WebP up to 10MB</p>
                </div>
              </div>
            )}
          </Card>
          <p className="text-[11px] text-stone-400 pl-1" aria-hidden="true">
            Images are processed securely. Results are not stored.
          </p>
        </div>

        {/* Output Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900" id="redacted-image-label">Redacted output</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={() => setShowOriginal(!showOriginal)}
                aria-label={showOriginal ? "Hide original image" : "Compare with original"}
              >
                {showOriginal ? <EyeOff className="w-4 h-4 mr-1.5" aria-hidden="true" /> : <Eye className="w-4 h-4 mr-1.5" aria-hidden="true" />}
                {showOriginal ? "Hide" : "Compare"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!output}
                onClick={() => output && downloadImageFile(output.output_image_url, "redacted_image.png")}
                aria-label="Download redacted image"
              >
                <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Download
              </Button>
            </div>
          </div>
          <Card 
            className="bg-stone-50/50 h-[360px] flex items-center justify-center relative focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1"
            role="region"
            aria-labelledby="redacted-image-label"
          >
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
            <div className="flex flex-wrap items-center gap-2 mt-2 pl-1" aria-live="polite">
              {analysis.summary && Object.entries(analysis.summary).map(([key, count]) => (
                <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 capitalize">
                  {key.replace(/_/g, ' ')}: {count as React.ReactNode}
                </span>
              ))}
              {analysis.job_id && (
                <span className="ml-auto text-[10px] font-mono text-stone-400 select-all" title="Job ID">
                  {analysis.job_id}
                </span>
              )}
            </div>
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

        <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto mt-4 sm:mt-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 px-1"
            aria-expanded={showAdvanced}
            aria-controls="image-advanced-options"
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            Advanced options
            {showAdvanced ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && (
        <Card id="image-advanced-options" className="p-5 mt-4 bg-stone-50 border-stone-200 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Detection</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={detectText}
                    onChange={(e) => setDetectText(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                  />
                  <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">Detect text regions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={detectFaces}
                    onChange={(e) => setDetectFaces(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                  />
                  <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">Detect faces</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transformation</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-600">Mode</label>
                <select
                  value={transformMode}
                  onChange={(e) => setTransformMode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                >
                  <option value="mask">Solid Mask</option>
                  <option value="blur">Blur</option>
                  <option value="pixelate">Pixelate</option>
                  <option value="overlay">Overlay Label</option>
                </select>
              </div>
              {transformMode === "blur" && (
                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-medium text-stone-600">Blur Radius: {blurRadius}px</label>
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
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Manual Regions</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-600">Regions JSON (Advanced)</label>
                <textarea
                  placeholder='[{"x": 10, "y": 10, "w": 100, "h": 50}]'
                  className="w-full h-24 px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-shadow"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
