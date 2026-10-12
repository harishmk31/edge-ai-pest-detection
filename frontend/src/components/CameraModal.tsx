import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : 'Could not access the camera. Check if another app is using it.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.92);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-forest-950 border border-forest-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-800 bg-forest-900/50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-agri-lime" />
            <h3 className="text-base font-semibold text-white font-display">Live Pest Camera Capture</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-forest-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-gray-200 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-forest-800 hover:bg-forest-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
            </div>
          ) : isStarting ? (
            <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-agri-lime" />
              <span>Starting camera feed...</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Center viewfinder guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-dashed border-agri-lime/70 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-[11px] text-white/90 bg-forest-950/80 px-2.5 py-1 rounded-full backdrop-blur-sm border border-forest-700">
                    Align pest inside rectangle
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-forest-900/60 border-t border-forest-800 flex items-center justify-between">
          <p className="text-xs text-gray-400 hidden sm:block">
            Hold camera steady and ensure good sunlight or focus.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-forest-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              disabled={!stream || !!error}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-agri-leaf hover:bg-agri-leaf/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 transition"
            >
              <Camera className="w-4 h-4 text-agri-lime" />
              <span>Snap & Analyze</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
