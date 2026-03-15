import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Image as ImageIcon, CheckCircle2, ChevronRight } from "lucide-react";
import ImageStepInput from "./ImageStepInput";
import ImageStepReview from "./ImageStepReview";
import ImageStepResult from "./ImageStepResult";
import { FindingRecord, JobRead, ImageAnalyzeManifest, JobReviewRequest } from "../../../lib/types";
import { api } from "../../../lib/api";

export default function NewImageJob() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Steps: 1 (Input), 2 (Review), 3 (Result)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Data State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  
  const [finalJob, setFinalJob] = useState<JobRead | null>(null);

  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate config from URL query params
  useEffect(() => {
    const configFromUrl = searchParams.get("config");
    if (configFromUrl) {
      setSelectedConfigId(configFromUrl);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please provide an image to analyze.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const manifest: ImageAnalyzeManifest = {
        content_type: "image",
        apply_builtins: true,
        configuration_ids: selectedConfigId ? [selectedConfigId] : [],
        persist_job: true,
        detect_text: true,
        detect_faces: true
      };

      const res = await api.analyzeImage(selectedFile, manifest);
      setJobId(res.job_id);
      setFindings(res.findings);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image.");
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
      setError(err.message || "Failed to transform image.");
    } finally {
      setIsTransforming(false);
    }
  };

  const resetFlow = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setJobId(null);
    setFindings([]);
    setFinalJob(null);
    setStep(1);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-indigo-600" />
            New Image Job
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Detect and redact sensitive regions and text in images.
          </p>
        </div>

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

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm shadow-stone-200/50 min-h-[500px]">
        {step === 1 && (
          <ImageStepInput 
            file={selectedFile}
            previewUrl={previewUrl}
            onChangeFile={(f, url) => {
              setSelectedFile(f);
              setPreviewUrl(url);
            }}
            configId={selectedConfigId}
            onChangeConfig={setSelectedConfigId}
            onNext={handleAnalyze}
            isProcessing={isAnalyzing}
          />
        )}
        {step === 2 && jobId && previewUrl && (
          <ImageStepReview 
            previewUrl={previewUrl}
            findings={findings}
            onBack={() => setStep(1)}
            onSubmit={handleReviewSubmit}
            isProcessing={isTransforming}
          />
        )}
        {step === 3 && finalJob && (
          <ImageStepResult 
            job={finalJob}
            onReset={resetFlow}
            previewUrl={previewUrl}
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