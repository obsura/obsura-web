import React, { useState } from "react";
import { JobRead } from "../../../lib/types";
import { downloadTextFile } from "../../../lib/utils";
import { Button, Card, PanelHeader } from "../../../components/common/UI";
import { Copy, Download, RefreshCw, FileCheck } from "lucide-react";

interface TextStepResultProps {
  job: JobRead;
  onStartNew: () => void;
}

export default function TextStepResult({ job, onStartNew }: TextStepResultProps) {
  const [copied, setCopied] = useState(false);
  
  // Extract output text from job outputs
  const outputRecord = job.outputs.find(o => o.content_type === "text" && o.output_text);
  const resultText = outputRecord?.output_text || job.source_text || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTextFile(resultText, `redacted_${job.id.substring(0, 8)}.txt`);
  };

  return (
    <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-4 duration-300">
      
      <div className="flex-1 flex flex-col space-y-4 max-w-4xl mx-auto w-full">
        
        <div className="flex flex-col items-center text-center space-y-2 py-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
            <FileCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Transformation Complete</h2>
          <p className="text-stone-500 text-sm">
            {job.findings.length} findings reviewed • Job ID: <span className="font-mono text-xs">{job.id.substring(0,8)}</span>
          </p>
        </div>

        <PanelHeader
          title="Redacted Output"
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1.5" />
                {copied ? "Copied!" : "Copy Text"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1.5" />
                Download
              </Button>
            </>
          }
        />
        
        <Card className="flex-1 bg-stone-50/50 p-5 overflow-auto font-mono text-sm leading-relaxed text-stone-800 whitespace-pre-wrap min-h-[300px]">
          {resultText}
        </Card>

      </div>

      <div className="mt-8 flex justify-center items-center border-t border-stone-100 pt-6">
        <Button variant="outline" onClick={onStartNew} className="min-w-[140px]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Start New Job
        </Button>
      </div>

    </div>
  );
}