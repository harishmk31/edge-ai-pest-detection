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
  ArrowRight, 
  ShieldCheck,
  Sprout,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { diagnoseImage } from '../services/api';
import type { DiagnosisResponse } from '../types';
import { ImageAnnotator } from '../components/ImageAnnotator';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { CameraModal } from '../components/CameraModal';
import { PestManagementCard } from '../components/PestManagementCard';
import { KuralIcon } from '../components/KuralIcon';
import { 
  getLocalizedPestName, 
  getLocalizedGroupName 
} from '../services/pestTranslations';

interface DiagnosisPageProps {
  onAskKural?: (pestName: string, diagnosisId?: string) => void;
}

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ onAskKural }) => {
  const { t, i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.35);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null);
  const [selectedPestIndex, setSelectedPestIndex] = useState<number>(0);
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
    setSelectedPestIndex(0);

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

  const executeDiagnosis = async (fileOverride?: File) => {
    const fileToAnalyze = fileOverride || selectedFile;
    if (!fileToAnalyze) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await diagnoseImage(fileToAnalyze, confidenceThreshold);
      setDiagnosisResult(response);
      setSelectedPestIndex(0);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setError(err.message || 'An unexpected error occurred during pest detection inference.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    handleFileSelection(file);
    setIsCameraOpen(false);
    executeDiagnosis(file);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setSelectedPestIndex(0);
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
            {t('diagnosis.header_sub')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 mt-1 font-display">
            {t('diagnosis.header_title')}
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            {t('diagnosis.header_desc')}
          </p>
        </div>

        {diagnosisResult && (
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-xl bg-white border border-agri-border hover:bg-agri-cream text-forest-950 text-xs font-semibold shadow-soft flex items-center gap-1.5 transition self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('diagnosis.diagnose_another')}</span>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-rose-900">Diagnosis Notice</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Upload & Workspace */}
      {!diagnosisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Box */}
          <div className="lg:col-span-2 space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                isDragging
                  ? 'border-agri-leaf bg-emerald-50/60 scale-[0.99]'
                  : 'border-agri-border bg-white hover:border-forest-600/50'
              } shadow-soft flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden`}
            >
              {previewUrl ? (
                <div className="space-y-4 w-full">
                  <div className="relative inline-block max-h-72 rounded-2xl overflow-hidden border border-agri-border shadow-md">
                    <img
                      src={previewUrl}
                      alt="Crop foliage preview"
                      className="max-h-72 w-auto object-contain select-none"
                    />
                    <button
                      onClick={resetAll}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-forest-950/80 text-white hover:bg-forest-900 transition text-xs"
                      title="Clear image"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-agri-cream border border-agri-border flex items-center justify-center mx-auto text-agri-leaf shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-forest-950 font-display">
                      {isDragging ? t('diagnosis.drop_here') : t('diagnosis.upload_zone_title')}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('diagnosis.upload_specs')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-agri-lime" />
                      <span>{t('diagnosis.browse_files')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-agri-border hover:bg-agri-cream text-forest-950 text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-agri-leaf" />
                      <span>{t('diagnosis.take_photo')}</span>
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
                  {t('diagnosis.ready_to_analyze')} <strong className="text-forest-950">{(confidenceThreshold * 100).toFixed(0)}%</strong>.
                </div>
                <button
                  onClick={() => executeDiagnosis()}
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-xl bg-agri-leaf hover:bg-agri-leaf/90 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-agri-lime" />
                      <span>{t('diagnosis.running_inference')}</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 text-agri-lime" />
                      <span>{t('diagnosis.run_btn')}</span>
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
                  {t('diagnosis.sensitivity_title')}
                </h3>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{t('diagnosis.confidence_filter')}</span>
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
                  <span>{t('diagnosis.filter_sensitive')}</span>
                  <span>{t('diagnosis.filter_default')}</span>
                  <span>{t('diagnosis.filter_strict')}</span>
                </div>
              </div>

              <div className="p-3 bg-agri-cream/70 rounded-xl border border-agri-border text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-agri-leaf shrink-0 mt-0.5" />
                <span>
                  {t('diagnosis.sensitivity_tip')}
                </span>
              </div>
            </div>

            {/* Field Scouting Best Practices Card */}
            <div className="bg-white p-6 rounded-2xl border border-agri-border shadow-soft space-y-3">
              <h3 className="text-sm font-bold text-forest-950 font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-agri-leaf" />
                <span>{t('diagnosis.scouting_title')}</span>
              </h3>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-agri-leaf font-bold">•</span>
                  <span><strong>{t('diagnosis.scouting_tip1_title')}</strong> {t('diagnosis.scouting_tip1_desc')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-agri-leaf font-bold">•</span>
                  <span><strong>{t('diagnosis.scouting_tip2_title')}</strong> {t('diagnosis.scouting_tip2_desc')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-agri-leaf font-bold">•</span>
                  <span><strong>{t('diagnosis.scouting_tip3_title')}</strong> {t('diagnosis.scouting_tip3_desc')}</span>
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
                    {t('diagnosis.pest_detected')}: {getLocalizedPestName(diagnosisResult.top_pest, i18n.language)}
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {diagnosisResult.total_detections} {t('diagnosis.occurrences_localized')} {diagnosisResult.execution_time_ms} ms.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {diagnosisResult.top_confidence && (
                  <ConfidenceBadge
                    confidence={diagnosisResult.top_confidence}
                    level={diagnosisResult.confidence_level}
                    size="lg"
                  />
                )}
                {onAskKural && (
                  <button
                    type="button"
                    onClick={() => onAskKural(diagnosisResult.top_pest || 'Identified Pest', diagnosisResult.diagnosis_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-bold transition shadow-sm border border-forest-800"
                  >
                    <KuralIcon className="w-3.5 h-3.5 text-agri-lime" />
                    <span>{t('kural.ask_kural_btn')}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-soft">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  {t('diagnosis.no_pest_detected')} {(confidenceThreshold * 100).toFixed(0)}% {t('diagnosis.confidence_level_label')}
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
                {t('diagnosis.canvas_disclaimer')}
              </p>
            </div>

            {/* Detections List & Detection Breakdown Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Localized Detections Breakdown */}
              <div className="bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-agri-border">
                  <h3 className="text-sm font-bold text-forest-950 font-display flex items-center gap-2">
                    <Layers className="w-4 h-4 text-agri-leaf" />
                    <span>{t('diagnosis.breakdown_title')}</span>
                  </h3>
                  <span className="text-xs font-mono font-semibold text-gray-500">
                    {diagnosisResult.detections.length} {t('diagnosis.total_detections')}
                  </span>
                </div>

                {diagnosisResult.detections.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">
                    {t('diagnosis.no_boxes_survived')}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {diagnosisResult.detections.map((det, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-agri-border bg-agri-cream/40 hover:bg-agri-cream transition space-y-2 cursor-pointer"
                        onClick={() => {
                          if (diagnosisResult.pest_management) {
                            const foundIdx = diagnosisResult.pest_management.findIndex(
                              (pm) => pm.pest_name === det.pest_name || pm.class_id === det.class_id
                            );
                            if (foundIdx >= 0) setSelectedPestIndex(foundIdx);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-forest-950">
                              {getLocalizedPestName(det.common_name, i18n.language)}
                            </span>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {t('diagnosis.dataset_label')}: {det.pest_name} (Class {det.class_id})
                            </div>
                          </div>
                          <ConfidenceBadge
                            confidence={det.confidence}
                            level={det.confidence_level}
                            size="sm"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-agri-border/60">
                          <span>{t('diagnosis.group_label')}: <strong>{getLocalizedGroupName(det.group, i18n.language)}</strong></span>
                          <span className="font-mono text-[10px] text-gray-400">
                            {t('diagnosis.box_label')}: [{det.bbox.join(', ')}]
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Summary Card */}
              {diagnosisResult.detections.length > 0 && (
                <div className="bg-white rounded-2xl border border-agri-border p-6 shadow-soft space-y-4">
                  <h3 className="text-sm font-bold text-forest-950 font-display flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-agri-leaf" />
                    <span>{t('diagnosis.scan_metadata_title')}</span>
                  </h3>

                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between pb-2 border-b border-agri-border/60">
                      <span>{t('diagnosis.processing_time')}:</span>
                      <strong className="font-mono text-forest-950">{diagnosisResult.execution_time_ms} ms</strong>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-agri-border/60">
                      <span>{t('diagnosis.storage_backend')}:</span>
                      <span className="uppercase font-mono font-bold text-agri-leaf">{diagnosisResult.storage_mode}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>{t('diagnosis.confidence_threshold')}:</span>
                      <strong className="font-mono text-forest-950">
                        {(confidenceThreshold * 100).toFixed(0)}%
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={resetAll}
                      className="text-xs font-semibold text-agri-leaf hover:underline flex items-center gap-1"
                    >
                      <span>{t('diagnosis.diagnose_another')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Pest Information & Management Guidance */}
          {diagnosisResult.pest_management && diagnosisResult.pest_management.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-agri-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-forest-950 flex items-center gap-2.5">
                    <Sprout className="w-6 h-6 text-agri-leaf" />
                    <span>{t('ipm.ipm_tab')}</span>
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Structured biological profiles, host crops, symptoms, and tiered IPM guidance (monitoring, cultural, biological, chemical).
                  </p>
                </div>

                {/* Multiple Species Selector Tabs */}
                {diagnosisResult.pest_management.length > 1 && (
                  <div className="flex items-center gap-1.5 p-1 bg-forest-900 rounded-xl">
                    {diagnosisResult.pest_management.map((pm, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPestIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                          selectedPestIndex === idx
                            ? 'bg-agri-leaf text-white shadow-sm'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <span>{getLocalizedPestName(pm.common_name, i18n.language)}</span>
                        <span className="px-1.5 py-0.2 rounded bg-forest-950 text-[10px] text-agri-lime font-mono">
                          x{pm.instance_count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Render Active Pest Management Card */}
              <PestManagementCard
                pest={diagnosisResult.pest_management[selectedPestIndex] || diagnosisResult.pest_management[0]}
                isSingleSpecies={diagnosisResult.pest_management.length === 1}
                onAskKural={(pName) => onAskKural?.(pName, diagnosisResult.diagnosis_id)}
              />
            </div>
          )}
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
