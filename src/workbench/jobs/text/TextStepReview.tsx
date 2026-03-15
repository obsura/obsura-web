import React, { useState } from "react";
import { FindingRecord, JobReviewRequest, ReviewDecision, JobReviewDecisionInput } from "../../../lib/types";
import { Button, Badge, Card, PanelHeader } from "../../../components/common/UI";
import { ArrowLeft, Check, X, Wand2, ShieldAlert } from "lucide-react";
import { cn } from "../../../lib/utils";

interface TextStepReviewProps {
  originalText: string;
  findings: FindingRecord[];
  onBack: () => void;
  onSubmit: (decisions: JobReviewRequest) => void;
  isProcessing: boolean;
}

export default function TextStepReview({
  originalText,
  findings,
  onBack,
  onSubmit,
  isProcessing
}: TextStepReviewProps) {
  // Local state for decisions
  const [decisions, setDecisions] = useState<Record<string, JobReviewDecisionInput>>(
    findings.reduce((acc, f) => {
      if (f.id) {
        acc[f.id] = { finding_id: f.id, decision: f.decision || "approved" };
      }
      return acc;
    }, {} as Record<string, JobReviewDecisionInput>)
  );

  const handleDecision = (id: string, decision: ReviewDecision) => {
    setDecisions(prev => ({
      ...prev,
      [id]: { ...prev[id], decision }
    }));
  };

  const handleOverride = (id: string, value: string) => {
    setDecisions(prev => ({
      ...prev,
      [id]: { ...prev[id], override_value: value }
    }));
  };

  const handleSubmit = () => {
    const payload: JobReviewRequest = {
      decisions: Object.values(decisions)
    };
    onSubmit(payload);
  };

  // Helper to render text with highlights
  const renderTextHighlights = () => {
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    
    // Sort findings by start index safely
    const sorted = [...findings].filter(f => typeof f.start_index === 'number').sort((a, b) => (a.start_index || 0) - (b.start_index || 0));

    sorted.forEach((finding, idx) => {
      if (typeof finding.start_index !== 'number' || typeof finding.end_index !== 'number') return;
      if (finding.start_index < lastIndex) return; // Skip overlapping
      
      // text before
      if (finding.start_index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{originalText.substring(lastIndex, finding.start_index)}</span>
        );
      }

      // the highlighted finding
      const decision = finding.id ? decisions[finding.id]?.decision : "pending";
      const isRejected = decision === "rejected";

      elements.push(
        <mark
          key={`mark-${finding.id || idx}`}
          className={cn(
            "px-1 py-0.5 rounded cursor-pointer transition-colors duration-200 border-b-2",
            isRejected 
              ? "bg-stone-100 text-stone-400 border-stone-200 line-through" 
              : "bg-indigo-100/80 text-indigo-900 border-indigo-400 font-medium"
          )}
          title={`${finding.entity_type} (${Math.round((finding.confidence || 0) * 100)}%)`}
        >
          {originalText.substring(finding.start_index, finding.end_index)}
        </mark>
      );

      lastIndex = finding.end_index;
    });

    if (lastIndex < originalText.length) {
      elements.push(<span key={`text-${lastIndex}`}>{originalText.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-4 duration-300">
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left: Original Text Preview */}
        <div className="flex-1 space-y-4 flex flex-col">
           <PanelHeader title="Review Findings" />
           <Card className="flex-1 p-5 overflow-auto font-mono text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
              {renderTextHighlights()}
           </Card>
        </div>

        {/* Right: Findings List */}
        <div className="w-full lg:w-[380px] space-y-4 flex flex-col">
          <PanelHeader title={`${findings.length} findings detected`} />
          <Card className="flex-1 overflow-auto bg-stone-50/50 p-2 divide-y divide-stone-100">
            {findings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-stone-500 text-center">
                <ShieldAlert className="w-8 h-8 mb-2 text-stone-300" />
                <p className="text-sm font-medium">No sensitive data found</p>
                <p className="text-xs mt-1">You can still proceed to transform or go back to edit text.</p>
              </div>
            ) : (
              findings.map((f) => {
                const dec = f.id ? decisions[f.id] : undefined;
                if (!f.id || !dec) return null;
                const isRejected = dec.decision === "rejected";

                return (
                  <div key={f.id} className={cn("p-3 space-y-3 transition-opacity", isRejected && "opacity-50")}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral" className="capitalize text-[10px]">
                            {f.entity_type}
                          </Badge>
                          <span className="text-[10px] text-stone-400">
                            {Math.round((f.confidence || 0) * 100)}%
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 inline-block text-stone-800">
                          {f.matched_text_preview}
                        </p>
                      </div>
                      
                      <div className="flex rounded-md border border-stone-200 overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => handleDecision(f.id!, "approved")}
                          className={cn("p-1.5 hover:bg-green-50 transition-colors", dec.decision === "approved" ? "bg-green-100 text-green-700" : "text-stone-400")}
                          title="Approve Redaction"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-stone-200" />
                        <button
                          onClick={() => handleDecision(f.id!, "rejected")}
                          className={cn("p-1.5 hover:bg-stone-50 transition-colors", dec.decision === "rejected" ? "bg-red-50 text-red-600" : "text-stone-400")}
                          title="Keep Original (Reject)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!isRejected && (
                      <div>
                        <input 
                          type="text" 
                          placeholder="Custom replacement (optional)"
                          className="w-full text-xs font-mono px-2 py-1.5 rounded border-stone-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={dec.override_value || ""}
                          onChange={(e) => handleOverride(f.id!, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex justify-between items-center border-t border-stone-100 pt-6">
        <Button variant="ghost" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={isProcessing}
          className="min-w-[140px]"
        >
          {isProcessing ? "Transforming..." : "Apply & Transform"}
          {!isProcessing && <Wand2 className="w-4 h-4 ml-1.5" />}
        </Button>
      </div>

    </div>
  );
}