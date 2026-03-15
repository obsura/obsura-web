// src/workbench/jobs/image/ImageStepResult.tsx
import React, { useState } from "react";
import { Download, CheckCircle2, RotateCcw, Box } from "lucide-react";
import { JobRead } from "../../../lib/types";
import { Button, Card, PanelHeader, Badge } from "../../../components/common/UI";
import { cn } from "../../../lib/utils";
import { env, joinUrl } from "../../../lib/env";

interface ImageStepResultProps {
  job: JobRead | null;
  onReset: () => void;
  previewUrl: string | null; // useful if output image fails
}

export default function ImageStepResult({ job, onReset, previewUrl }: ImageStepResultProps) {
  const [downloading, setDownloading] = useState(false);

  // Fallbacks if outputs missing (API might return "image/png" or "image")
  const outputRecord = job?.outputs?.find(o => o.content_type?.startsWith("image") && o.media_url);
  const transformedSrc = outputRecord?.media_url ? joinUrl(env.API_ORIGIN, outputRecord.media_url) : null;
  const outputSrc = transformedSrc || previewUrl;
  const isTransformed = !!transformedSrc;
  
  const handleDownload = async () => {
    if (!outputSrc) return;
    try {
      setDownloading(true);
      const res = await fetch(outputSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted_${job?.id || "image"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
      
      {/* Header Info Banner */}
      <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center mb-6">
        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
        <div>
          <p className="font-semibold">Redaction Complete</p>
          <p className="text-sm">The image has been processed based on your approvals.</p>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 mt-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-4 flex flex-col items-center">
          <PanelHeader title="Transformed Image" />
          
          <Card className="flex-1 w-full bg-stone-900 border-stone-800 p-6 flex flex-col justify-center items-center rounded-xl relative overflow-hidden group">
             {outputSrc ? (
               <img 
                 src={outputSrc} 
                 alt="Result Preview" 
                 className="max-h-[60vh] object-contain rounded drop-shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
               />
             ) : (
                <div className="text-stone-500 mb-2">No output generated.</div>
             )}

             <div className="absolute top-6 left-6 flex flex-col gap-2">
               <Badge variant={isTransformed ? "success" : "warning"} className="opacity-90 shadow-sm border border-black/10">
                 {isTransformed ? "Transformed" : "Original"}
               </Badge>
             </div>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex justify-center gap-4 py-8 border-t border-stone-100">
        <Button variant="outline" onClick={onReset} className="min-w-[140px]">
          <RotateCcw className="w-4 h-4 mr-2" />
          Run Another
        </Button>
        <Button variant="primary" onClick={handleDownload} disabled={!outputSrc || downloading} className="min-w-[160px]">
          {downloading ? "Preparing..." : "Download Result"}
          {!downloading && <Download className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      <div className="text-center pb-4 text-xs font-mono text-stone-400">
        Job ID: {job?.id || "—"}
      </div>
    </div>
  );
}