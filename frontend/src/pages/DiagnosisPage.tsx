import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Scan, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Info, 
  FileText, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import { diagnoseImage } from '../services/api';
import type { DiagnosisResponse } from '../types';
import { ImageAnnotator } from '../components/ImageAnnotator';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { CameraModal } from '../components/CameraModal';

export const DiagnosisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.35);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File) => {
    // Basic file validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setError(`Unsupported file type '${file.type}'. Please upload a JPEG, PNG, or WebP image.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB maximum limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setDiagnosisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const executeDiagnosis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await diagnoseImage(selectedFile, confidenceThreshold);
      setDiagnosisResult(response);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setError(err.message || 'An unexpected error occurred during pest detection inference.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-agri-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
            On-Device Object Detection
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 mt-1 font-display">
            AI Crop Pest Diagnosis
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            Upload field foliage photos or launch real-time camera capture. The normalized YOLO11 detector localizes insect pests and estimates model pattern confidence across 102 taxonomic classes.
          </p>
        </div>

        {diagnosisResult && (
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-xl bg-white border border-agri-border hover:bg-agri-cream text-forest-950 text-xs font-semibold shadow-soft flex items-center gap-1.5 transition self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Diagnose Another Image</span>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-rose-900">Diagnosis Notice</h4>
            <p className="mt-0.5 text-rose-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main Workflow View */}
      {!diagnosisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload & Capture Workspace */}
          <div className="lg:col-span-2 space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bg-white relative flex flex-col items-center justify-center min-h-[380px] shadow-soft ${
                isDragging
                  ? 'border-agri-leaf bg-agri-cream/50 scale-[0.99]'
                  : 'border-agri-border hover:border-forest-700/50'
              }`}
            >
              {previewUrl ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="relative max-h-[340px] rounded-xl overflow-hidden shadow-card border border-agri-border">
                    <img
                      src={previewUrl}
                      alt="Upload preview"
                      className="max-h-[340px] w-auto object-contain bg-stone-900"
                    />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / (1024 * 1024) : 0).toFixed(2)} MB)
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-agri-border text-xs font-medium text-gray-700 hover:bg-agri-cream"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={resetAll}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-agri-cream border border-agri-border flex items-center justify-center mx-auto text-forest-800 shadow-sm">
                    <Upload className="w-8 h-8 text-agri-leaf" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-forest-950 font-display">
                      Drag & Drop your crop photograph
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports JPEG, PNG, and WebP (up to 15MB). EXIF rotation and RGBA channels are normalized automatically.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-agri-lime" />
                      <span>Select Local File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-agri-border hover:bg-agri-cream text-forest-950 text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-agri-leaf" />
                      <span>Live Camera Snapshot</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/bmp"
                onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Action Bar */}
            {selectedFile && (
              <div className="bg-white p-5 rounded-2xl border border-agri-border shadow-soft flex items-center justify-between gap-4">
                <div className="text-xs text-gray-600">
                  Ready to analyze with confidence threshold <strong className="text-forest-950">{(confidenceThreshold * 100).toFixed(0)}%</strong>.
                </div>
                <button
                  onClick={executeDiagnosis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-xl bg-agri-leaf hover:bg-agri-leaf/90 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-agri-lime" />
                      <span>Running Inference...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 text-agri-lime" />
                      <span>Run AI Pest Diagnosis</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Settings & Scouting Tips Sidebar */}
          <div className="space-y-6">
            {/* Inference Parameters Card */}
            <div className="bg-white p-6 rounded-2xl border border-agri-border shadow-soft space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-agri-border">
                <Sliders className="w-4 h-4 text-agri-leaf" />
                <h3 className="text-sm font-bold text-forest-950 font-display">
                  Inference Sensitivity
                </h3>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">Confidence Filter</span>
                  <span className="font-mono font-bold text-forest-900 bg-agri-cream px-2 py-0.5 rounded border border-agri-border">
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-agri-leaf cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>10% (Sensitive)</span>
                  <span>35% (Default)</span>
                  <span>80% (Strict)</span>
                </div>
              </div>

              <div className="p-3 bg-agri-cream/70 rounded-xl border border-agri-border text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-agri-leaf shrink-0 mt-0.5" />
                <span>
                  Lower thresholds detect smaller or partially hidden insects, but may increase false alarms on leaf blemishes.
                </span>
              </div>
            </div>

            {/* Field Scouting Best Practices Card */}
            <div className="bg-white p-6 rounded-2xl border border-agri-border shadow-soft space-y-3">
              <h3 className="text-sm font-bold text-forest-950 font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-agri-leaf" />
                <span>High-Accuracy Scouting Advice</span>
              </h3>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-agri-leaf font-bold">•</span>
                  <span><strong>Close-Up Distance:</strong> Position the camera 10–25 cm from the insect or affected leaf.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-agri-leaf font-bold">•</span>
                  <span><strong>Natural Lighting:</strong> Diffused morning or overcast light yields sharper contrast than direct flash.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-agri-leaf font-bold">•</span>
                  <span><strong>Underside of Leaves:</strong> Mites and aphids congregate on the ventral leaf surfaces.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-8 animate-fadeIn">
          {/* Top Status Alert */}
          {diagnosisResult.status === 'detected' ? (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950">
                    Pest Detected: {diagnosisResult.top_pest}
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {diagnosisResult.total_detections} bounding box occurrence(s) localized in {diagnosisResult.execution_time_ms} ms.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {diagnosisResult.top_confidence && (
                  <ConfidenceBadge
                    confidence={diagnosisResult.top_confidence}
                    level={diagnosisResult.confidence_level}
                    size="lg"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-soft">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  No Pest Detected Above {(confidenceThreshold * 100).toFixed(0)}% Confidence
                </h3>
                <p className="text-xs text-amber-800 mt-1 max-w-3xl leading-relaxed">
                  {diagnosisResult.notes}
                </p>
              </div>
            </div>
          )}

          {/* Grid: Image Annotator & Detection Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visualizer Canvas */}
            <div className="lg:col-span-7">
              <ImageAnnotator
                annotatedImageBase64={diagnosisResult.annotated_image}
                originalImagePreviewUrl={previewUrl || undefined}
                detections={diagnosisResult.detections}
              />
              <p className="text-[11px] text-gray-500 mt-2 italic text-center">
                * Bounding boxes reflect detector localized coordinates. Model scores reflect pattern similarity, not absolute biological certainty.
              </p>
            </div>

            {/* Detections List & Biological Guidance */}
            <div className="lg:col-span-5 space-y-6">
              {/* Localized Detections Accordion/Cards */}
              <div className="bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-agri-border">
                  <h3 className="text-sm font-bold text-forest-950 font-display flex items-center gap-2">
                    <Layers className="w-4 h-4 text-agri-leaf" />
                    <span>Detections Breakdown</span>
                  </h3>
                  <span className="text-xs font-mono font-semibold text-gray-500">
                    {diagnosisResult.detections.length} total
                  </span>
                </div>

                {diagnosisResult.detections.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">
                    No individual bounding boxes survived the threshold filter.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {diagnosisResult.detections.map((det, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-agri-border bg-agri-cream/40 hover:bg-agri-cream transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-forest-950">
                              {det.common_name}
                            </span>
                            <div className="text-[11px] text-gray-500 font-mono">
                              Dataset label: {det.pest_name} (Class {det.class_id})
                            </div>
                          </div>
                          <ConfidenceBadge
                            confidence={det.confidence}
                            level={det.confidence_level}
                            size="sm"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-agri-border/60">
                          <span>Group: <strong>{det.group}</strong></span>
                          <span className="font-mono text-[10px] text-gray-400">
                            Box: [{det.bbox.join(', ')}]
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Biological Biology & Evidence Guidance */}
              {diagnosisResult.detections.length > 0 && (
                <div className="bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-4">
                  <h3 className="text-sm font-bold text-forest-950 font-display flex items-center gap-2">
                    <FileText className="w-4 h-4 text-agri-leaf" />
                    <span>Agronomic Field Guidance</span>
                  </h3>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div>
                      <span className="font-semibold text-forest-900 block mb-0.5">Visible Symptoms & Habits:</span>
                      <p className="text-gray-600 bg-agri-cream/50 p-2.5 rounded-lg border border-agri-border">
                        {diagnosisResult.detections[0].symptoms}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-forest-900 block mb-0.5">Management Context:</span>
                      <p className="text-gray-600 bg-agri-cream/50 p-2.5 rounded-lg border border-agri-border">
                        {diagnosisResult.detections[0].relevance}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      Storage mode: <strong className="uppercase font-mono">{diagnosisResult.storage_mode}</strong>
                    </span>
                    <button
                      onClick={resetAll}
                      className="text-xs font-semibold text-agri-leaf hover:underline flex items-center gap-1"
                    >
                      <span>Diagnose another photo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleFileSelection}
      />
    </div>
  );
};
