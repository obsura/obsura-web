import React, { useState, useRef, useEffect } from "react";
import { FindingRecord, JobReviewRequest, ReviewDecision, JobReviewDecisionInput } from "../../../lib/types";
import { Button, Badge, Card } from "../../../components/common/UI";
import { ArrowLeft, Check, X, Wand2, ShieldAlert, CheckSquare, XSquare } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ImageStepReviewProps {
  previewUrl: string;
  findings: FindingRecord[];
  onBack: () => void;
  onSubmit: (decisions: JobReviewRequest) => void;
  isProcessing: boolean;
}

export default function ImageStepReview({
  previewUrl,
  findings,
  onBack,
  onSubmit,
  isProcessing
}: ImageStepReviewProps) {
  // Local state for decisions
  const [decisions, setDecisions] = useState<Record<string, JobReviewDecisionInput>>(
    findings.reduce((acc, f) => {
      if (f.id) {
        acc[f.id] = { finding_id: f.id, decision: f.decision || "approved" };
      }
      return acc;
    }, {} as Record<string, JobReviewDecisionInput>)
  );

  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);

  // For drawing the image scaled naturally within the container to overlap absolute regions correctly
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [previewUrl]);

  const handleDecision = (id: string, decision: ReviewDecision) => {
    setDecisions(prev => ({
      ...prev,
      [id]: { ...prev[id], decision }
    }));
  };

  const handleBulkDecision = (decision: ReviewDecision) => {
    setDecisions(prev => {
      const next = { ...prev };
      for (const key in next) {
        next[key] = { ...next[key], decision };
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const payload: JobReviewRequest = {
      decisions: Object.values(decisions)
    };
    onSubmit(payload);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] p-6 animate-in slide-in-from-right-4 duration-300">
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
        
        {/* Left: Original Image Preview with SVG Bounding Boxes */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
           <div className="pb-2 mb-2 border-b border-stone-100 flex items-center justify-between">
             <h3 className="text-sm font-semibold text-stone-800">Review Context</h3>
           </div>
           <Card 
              className="flex-1 relative overflow-hidden flex items-center justify-center p-4 border border-stone-200 min-h-0"
              style={{
                 backgroundColor: "white",
                 backgroundImage: "radial-gradient(rgb(229, 231, 235) 1px, transparent 0)",
                 backgroundSize: "20px 20px"
              }}
           >
             {imageSize.width > 0 && (
               <div 
                  ref={containerRef}
                  className="relative pointer-events-none shadow-sm rounded-md overflow-hidden bg-white/50"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    aspectRatio: `${imageSize.width} / ${imageSize.height}`,
                  }}
               >
                 <img 
                    src={previewUrl} 
                    alt="Review" 
                    className="w-full h-full object-contain pointer-events-auto"
                 />
                 
                 {/* Bounding Boxes Container */}
                 <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                 >
                   {findings.map(f => {
                      if (!f.region) return null;
                      const dec = f.id ? decisions[f.id] : undefined;
                      const isRejected = dec?.decision === "rejected";
                      const isHovered = f.id === hoveredFindingId;
                      
                      let strokeColor = "rgba(79, 70, 229, 0.8)"; // indigo 
                      let fillColor = "rgba(79, 70, 229, 0.1)";

                      if (isRejected) {
                        strokeColor = "rgba(168, 162, 158, 0.6)"; // stone
                        fillColor = "transparent";
                      } else if (isHovered) {
                        strokeColor = "rgba(79, 70, 229, 1)";
                        fillColor = "rgba(79, 70, 229, 0.3)";
                      }

                      return (
                        <rect
                          key={f.id}
                          x={f.region.x}
                          y={f.region.y}
                          width={f.region.width}
                          height={f.region.height}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isHovered ? 4 : 2}
                          rx={4}
                          className="transition-all duration-200"
                        />
                      );
                   })}
                 </svg>
               </div>
             )}
           </Card>
        </div>

        {/* Right: Findings List */}
        <div className="w-full lg:w-[420px] flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                {findings.length}
              </span>
              Findings
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => handleBulkDecision("approved")}
                className="text-xs flex items-center gap-1.5 text-stone-500 hover:text-green-700 bg-stone-50 hover:bg-green-50 px-2 py-1.5 rounded-md font-medium transition-colors"
                title="Approve All"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Approve All</span>
              </button>
              <button 
                onClick={() => handleBulkDecision("rejected")}
                className="text-xs flex items-center gap-1.5 text-stone-500 hover:text-red-700 bg-stone-50 hover:bg-red-50 px-2 py-1.5 rounded-md font-medium transition-colors"
                title="Reject All"
              >
                <XSquare className="w-3.5 h-3.5" />
                <span>Reject All</span>
              </button>
            </div>
          </div>
          <Card className="flex-1 overflow-auto bg-stone-50/50 p-2 divide-y divide-stone-100 min-h-0">
            {findings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-stone-500 text-center">
                <ShieldAlert className="w-8 h-8 mb-2 text-stone-300" />
                <p className="text-sm font-medium">No sensitive regions found</p>
                <p className="text-xs mt-1">You can still proceed to transform or go back to edit.</p>
              </div>
            ) : (
              findings.map((f, i) => {
                const dec = f.id ? decisions[f.id] : undefined;
                if (!f.id || !dec) return null;
                const isRejected = dec.decision === "rejected";

                return (
                  <div 
                    key={f.id} 
                    className={cn(
                      "p-2.5 transition-opacity border border-transparent rounded-lg flex items-start gap-3", 
                      isRejected ? "opacity-50 grayscale" : "",
                      hoveredFindingId === f.id ? "bg-white border-stone-200 shadow-sm" : ""
                    )}
                    onMouseEnter={() => setHoveredFindingId(f.id!)}
                    onMouseLeave={() => setHoveredFindingId(null)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 rounded px-1.5 py-0.5">#{i+1}</span>
                        <Badge variant="neutral" className="capitalize text-[10px] py-0">
                          {f.entity_type}
                        </Badge>
                        <span className="text-[10px] text-stone-400">
                          {Math.round((f.confidence || 0) * 100)}%
                        </span>
                      </div>
                      {f.matched_text_preview && (
                        <div className="text-[11px] font-mono text-stone-600 bg-stone-100/80 px-2 py-1 rounded inline-block truncate max-w-full" title={f.matched_text_preview}>
                          {f.matched_text_preview}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex rounded border border-stone-200 overflow-hidden bg-white shadow-sm shrink-0">
                      <button
                        onClick={() => handleDecision(f.id!, "approved")}
                        className={cn("p-1 hover:bg-green-50 transition-colors", dec.decision === "approved" ? "bg-green-50 text-green-600 font-bold" : "text-stone-300")}
                        title="Approve Box"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px bg-stone-200" />
                      <button
                        onClick={() => handleDecision(f.id!, "rejected")}
                        className={cn("p-1 hover:bg-stone-50 transition-colors", dec.decision === "rejected" ? "bg-red-50 text-red-600 font-bold" : "text-stone-300")}
                        title="Reject Box"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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