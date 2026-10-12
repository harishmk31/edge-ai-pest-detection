import React, { useState } from 'react';
import { Eye, Download, Layers } from 'lucide-react';
import type { DetectionItem } from '../types';

interface ImageAnnotatorProps {
  annotatedImageBase64: string;
  originalImagePreviewUrl?: string;
  detections: DetectionItem[];
}

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  annotatedImageBase64,
  originalImagePreviewUrl,
  detections,
}) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'original'>('annotated');

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = annotatedImageBase64;
    link.download = `agrivision_detection_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageSrc = viewMode === 'annotated' || !originalImagePreviewUrl
    ? annotatedImageBase64
    : originalImagePreviewUrl;

  return (
    <div className="bg-white rounded-2xl border border-agri-border overflow-hidden shadow-card flex flex-col">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-agri-border bg-agri-cream/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-agri-leaf" />
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-900 font-display">
            Inspection Canvas
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-forest-900 text-agri-lime font-mono">
            {detections.length} {detections.length === 1 ? 'box' : 'boxes'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {originalImagePreviewUrl && (
            <div className="inline-flex rounded-lg border border-agri-border p-0.5 bg-white text-xs">
              <button
                onClick={() => setViewMode('annotated')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'annotated'
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Annotated
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'original'
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Original Photo
              </button>
            </div>
          )}

          <button
            onClick={downloadImage}
            title="Download annotated result"
            className="p-1.5 rounded-lg border border-agri-border bg-white hover:bg-agri-cream text-gray-700 hover:text-forest-950 transition flex items-center gap-1.5 text-xs font-medium px-2.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Image</span>
          </button>
        </div>
      </div>

      {/* Image Display */}
      <div className="relative bg-stone-900 flex items-center justify-center p-2 min-h-[340px] max-h-[560px] overflow-hidden select-none">
        <img
          src={imageSrc}
          alt="AI pest detection result"
          className="max-h-[540px] w-auto max-w-full object-contain rounded-lg shadow-sm"
        />

        {/* View mode indicator overlay badge */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-agri-lime" />
          <span>Viewing: {viewMode === 'annotated' ? 'YOLO Inference Bounding Boxes' : 'Original Raw Photograph'}</span>
        </div>
      </div>
    </div>
  );
};
