import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type CameraStatus = 'idle' | 'starting' | 'ready' | 'error';
type ErrorKind = 'permission' | 'not_found' | 'in_use' | 'insecure' | 'generic';

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Stop active media tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('Error stopping media track:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
    setDimensions(null);
  }, []);

  // Initialize camera using standard MediaDevices API
  const startCamera = useCallback(async () => {
    stopCamera();
    setStatus('starting');
    setErrorMessage(null);
    setErrorKind(null);

    // 1. Check navigator.mediaDevices support & secure context
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      const isHttp =
        typeof window !== 'undefined' &&
        window.location.protocol !== 'https:' &&
        !['localhost', '127.0.0.1'].includes(window.location.hostname);

      setStatus('error');
      setErrorKind(isHttp ? 'insecure' : 'generic');
      setErrorMessage(isHttp ? t('camera.insecure_desc') : 'Browser does not support getUserMedia.');
      return;
    }

    try {
      let mediaStream: MediaStream;

      // Attempt high-quality environment camera with automatic fallback to standard webcam
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Environment camera constraint failed, retrying with standard video:', firstErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      // Check if modal was closed while user was granting permission
      if (!isMountedRef.current || !isOpen) {
        mediaStream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = mediaStream;

      const video = videoRef.current;
      if (!video) {
        mediaStream.getTracks().forEach((t) => t.stop());
        setStatus('error');
        setErrorKind('generic');
        setErrorMessage('Video display element was not ready.');
        return;
      }

      video.srcObject = mediaStream;

      const markReady = () => {
        if (!isMountedRef.current) return;
        video
          .play()
          .then(() => {
            if (isMountedRef.current) {
              setStatus('ready');
              setDimensions({
                width: video.videoWidth || 1280,
                height: video.videoHeight || 720,
              });
            }
          })
          .catch((playErr) => {
            console.warn('Video play() call handled:', playErr);
            if (video.videoWidth > 0 && isMountedRef.current) {
              setStatus('ready');
              setDimensions({
                width: video.videoWidth,
                height: video.videoHeight,
              });
            }
          });
      };

      if (video.readyState >= 2 && video.videoWidth > 0) {
        markReady();
      } else {
        video.onloadedmetadata = () => {
          markReady();
        };
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      if (!isMountedRef.current) return;

      setStatus('error');
      const errName = err.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorKind('permission');
        setErrorMessage(t('camera.perm_err_desc'));
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorKind('not_found');
        setErrorMessage(t('camera.not_found_desc'));
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setErrorKind('in_use');
        setErrorMessage(t('camera.in_use_desc'));
      } else {
        setErrorKind('generic');
        setErrorMessage(
          err.message || 'Unable to access the camera. Check device permissions and connections.'
        );
      }
    }
  }, [isOpen, stopCamera, t]);

  // Lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Capture frame into canvas and produce JPEG File
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || status !== 'ready' || isCapturing) return;

    setIsCapturing(true);

    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setErrorMessage('Could not initialize 2D canvas context for capture.');
        setIsCapturing(false);
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setErrorMessage('Could not generate image file from video frame.');
            setIsCapturing(false);
            return;
          }

          const file = new File(
            [blob],
            `live_pest_capture_${Date.now()}.jpg`,
            { type: 'image/jpeg', lastModified: Date.now() }
          );

          // Stop camera stream cleanly before emitting
          stopCamera();
          setIsCapturing(false);
          onCapture(file);
        },
        'image/jpeg',
        0.92
      );
    } catch (err: any) {
      console.error('Frame capture error:', err);
      setErrorMessage(`Snapshot failed: ${err.message || 'Unknown error'}`);
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  const getErrorTitle = () => {
    switch (errorKind) {
      case 'permission':
        return t('camera.perm_err_title');
      case 'not_found':
        return t('camera.not_found_title');
      case 'in_use':
        return t('camera.in_use_title');
      case 'insecure':
        return t('camera.insecure_title');
      default:
        return t('camera.generic_err_title');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-forest-950 border border-forest-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-800 bg-forest-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-800 border border-forest-700 flex items-center justify-center">
              <Camera className="w-4 h-4 text-agri-lime" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                {t('camera.title')}
              </h3>
              <p className="text-[11px] text-gray-400">
                {t('camera.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-forest-800 transition"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport Area */}
        <div className="relative bg-stone-950 aspect-video flex items-center justify-center overflow-hidden select-none">
          {/* Video is ALWAYS rendered in DOM so videoRef is never null */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              status === 'ready' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Overlay: Ready state with dashed alignment guide */}
          {status === 'ready' && (
            <>
              {/* Ready Status Pill at Top-Left */}
              <div className="absolute top-3 left-3 bg-forest-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-forest-700/80 flex items-center gap-2 text-xs text-white z-10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-agri-lime animate-pulse"></span>
                <span className="font-medium">{t('camera.active')}</span>
                {dimensions && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    ({dimensions.width}×{dimensions.height})
                  </span>
                )}
              </div>

              {/* Viewfinder Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-dashed border-agri-lime/90 rounded-2xl flex flex-col items-center justify-between p-3 shadow-2xl bg-black/10 backdrop-contrast-105">
                  <div className="text-[10px] text-agri-lime font-mono font-semibold uppercase tracking-wider">
                    {t('camera.target_zone')}
                  </div>
                  <span className="text-xs text-white bg-forest-950/90 px-3 py-1 rounded-full backdrop-blur-md border border-forest-700 shadow-md">
                    {t('camera.align_pest')}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Overlay: Starting / Connecting state */}
          {status === 'starting' && (
            <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center gap-3 text-gray-300 z-20">
              <RefreshCw className="w-8 h-8 animate-spin text-agri-lime" />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{t('camera.connecting')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('camera.connecting_sub')}</p>
              </div>
            </div>
          )}

          {/* Overlay: Error state */}
          {status === 'error' && (
            <div className="absolute inset-0 bg-stone-950/95 p-6 flex flex-col items-center justify-center text-center z-20 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-display mb-1">
                {getErrorTitle()}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-4 max-w-sm">
                {errorMessage}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-agri-leaf hover:bg-forest-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('camera.try_again')}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-gray-300 rounded-xl text-xs font-semibold transition"
                >
                  {t('camera.close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-forest-900/60 border-t border-forest-800 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block">
            {t('camera.lighting_tip')}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              disabled={isCapturing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-forest-800 transition disabled:opacity-50"
            >
              {t('camera.cancel')}
            </button>
            <button
              onClick={capturePhoto}
              disabled={status !== 'ready' || isCapturing}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-agri-leaf hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 transition"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-agri-lime" />
                  <span>{t('camera.capturing')}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-agri-lime" />
                  <span>{t('camera.snap_analyze')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
