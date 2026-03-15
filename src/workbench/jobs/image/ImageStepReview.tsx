import React, { useState, useRef, useEffect } from "react";
import { FindingRecord, JobReviewRequest, ReviewDecision, JobReviewDecisionInput } from "../../../lib/types";
import { Button, Badge, Card, PanelHeader } from "../../../components/common/UI";
import { ArrowLeft, Check, X, Wand2, ShieldAlert } from "lucide-react";
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

  const handleSubmit = () => {
    const payload: JobReviewRequest = {
      decisions: Object.values(decisions)
    };
    onSubmit(payload);
  };

  return (
    <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-4 duration-300">
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Left: Original Image Preview with SVG Bounding Boxes */}
        <div className="flex-1 space-y-4 flex flex-col">
           <PanelHeader title="Review Context" />
           <Card className="flex-1 relative bg-stone-900 overflow-hidden flex items-center justify-center p-4">
             {imageSize.width > 0 && (
               <div 
                  ref={containerRef}
                  className="relative pointer-events-none"
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
        <div className="w-full lg:w-[380px] space-y-4 flex flex-col">
          <PanelHeader title={`${findings.length} findings detected`} />
          <Card className="flex-1 overflow-auto bg-stone-50/50 p-2 divide-y divide-stone-100 min-h-[300px]">
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
                      "p-3 space-y-3 transition-opacity border border-transparent rounded-lg", 
                      isRejected ? "opacity-50" : "",
                      hoveredFindingId === f.id ? "bg-white border-stone-200 shadow-sm" : ""
                    )}
                    onMouseEnter={() => setHoveredFindingId(f.id!)}
                    onMouseLeave={() => setHoveredFindingId(null)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 rounded px-1.5">#{i+1}</span>
                          <Badge variant="neutral" className="capitalize text-[10px]">
                            {f.entity_type}
                          </Badge>
                          <span className="text-[10px] text-stone-400">
                            {Math.round((f.confidence || 0) * 100)}%
                          </span>
                        </div>
                        {f.matched_text_preview && (
                          <div className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-1 rounded inline-block truncate max-w-[200px]" title={f.matched_text_preview}>
                            "{f.matched_text_preview}"
                          </div>
                        )}
                      </div>
                      
                      <div className="flex rounded-md border border-stone-200 overflow-hidden bg-white shadow-sm shrink-0">
                        <button
                          onClick={() => handleDecision(f.id!, "approved")}
                          className={cn("p-1.5 hover:bg-green-50 transition-colors", dec.decision === "approved" ? "bg-green-100 text-green-700" : "text-stone-400")}
                          title="Approve Box"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-stone-200" />
                        <button
                          onClick={() => handleDecision(f.id!, "rejected")}
                          className={cn("p-1.5 hover:bg-stone-50 transition-colors", dec.decision === "rejected" ? "bg-red-50 text-red-600" : "text-stone-400")}
                          title="Reject Box"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
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