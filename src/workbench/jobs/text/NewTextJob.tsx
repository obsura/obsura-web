import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, ArrowRight, CheckCircle2, ChevronRight, CornerDownRight } from "lucide-react";
import TextStepInput from "./TextStepInput";
import TextStepReview from "./TextStepReview";
import TextStepResult from "./TextStepResult";
import { FindingRecord, JobRead, TextAnalysisRequest, JobReviewRequest } from "../../../lib/types";
import { api } from "../../../lib/api";

export default function NewTextJob() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Step 1: 1 (Input), 2 (Review), 3 (Result)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Data State
  const [inputText, setInputText] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  
  const [finalJob, setFinalJob] = useState<JobRead | null>(null);

  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate configuration from URL query params
  useEffect(() => {
    const configFromUrl = searchParams.get("config");
    if (configFromUrl) {
      setSelectedConfigId(configFromUrl);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError("Please provide some text to analyze.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const req: TextAnalysisRequest = {
        content: inputText,
        content_type: "text",
        apply_builtins: true, // We can make this configurable later
        configuration_ids: selectedConfigId ? [selectedConfigId] : [],
        persist_job: true,
      };

      const res = await api.analyzeText(req);
      setJobId(res.job_id);
      setFindings(res.findings);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to analyze text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReviewSubmit = async (decisions: JobReviewRequest) => {
    if (!jobId) return;

    try {
      setIsTransforming(true);
      setError(null);
      const res = await api.reviewJob(jobId, decisions);
      setFinalJob(res);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to transform text.");
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Steps */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            New Text Job
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Detect and redact sensitive information from text.
          </p>
        </div>

        {/* Breadcrumb Steps */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <StepIndicator num={1} label="Input" active={step === 1} done={step > 1} />
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <StepIndicator num={2} label="Review" active={step === 2} done={step > 2} />
          <ChevronRight className="w-4 h-4 text-stone-300" />
          <StepIndicator num={3} label="Result" active={step === 3} done={step > 3} />
        </div>
      </div>

      {error && (
         <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
           {error}
         </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm shadow-stone-200/50 min-h-[500px]">
        {step === 1 && (
          <TextStepInput 
            text={inputText} 
            onChangeText={setInputText}
            configId={selectedConfigId}
            onChangeConfig={setSelectedConfigId}
            onNext={handleAnalyze}
            isProcessing={isAnalyzing}
          />
        )}
        {step === 2 && jobId && (
          <TextStepReview 
            originalText={inputText}
            findings={findings}
            onBack={() => setStep(1)}
            onSubmit={handleReviewSubmit}
            isProcessing={isTransforming}
          />
        )}
        {step === 3 && finalJob && (
          <TextStepResult 
            job={finalJob}
            onStartNew={() => {
              setInputText("");
              setJobId(null);
              setFindings([]);
              setFinalJob(null);
              setStep(1);
            }}
          />
        )}
      </div>
    </div>
  );
}

function StepIndicator({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-indigo-600">
        <CheckCircle2 className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${active ? "text-stone-900" : "text-stone-400"}`}>
      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${active ? "bg-indigo-100 text-indigo-700" : "bg-stone-100 text-stone-500"}`}>
        {num}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}