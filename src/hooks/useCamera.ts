/**
 * MASTER AI - Real Camera MediaStream Hook
 * 
 * Manages:
 * - Real browser camera access (navigator.mediaDevices.getUserMedia)
 * - Safe video element attachment & playback
 * - Detailed error taxonomy (NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError)
 * - Clean track disposal on unmount
 * - Debug lifecycle logging
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCameraReturn {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  isInitializing: boolean;
  isActive: boolean;
  permissionDenied: boolean;
  deviceNotFound: boolean;
  error: string | null;
  startCamera: () => Promise<MediaStream | null>;
  stopCamera: () => void;
  retryCamera: () => Promise<void>;
}

export function useCamera(autoStart = true): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [deviceNotFound, setDeviceNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null) as React.RefObject<HTMLVideoElement>;
  const isMountedRef = useRef(true);

  // Safely attach stream to video element and play
  const attachStreamToVideo = useCallback((mediaStream: MediaStream, videoEl: HTMLVideoElement | null) => {
    if (!videoEl) {
      console.warn('[Camera] Video element ref is null; stream will be attached on render');
      return;
    }
    try {
      if (videoEl.srcObject !== mediaStream) {
        videoEl.srcObject = mediaStream;
      }
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[Camera] video playback started successfully');
          })
          .catch((err) => {
            console.warn('[Camera] video.play() note:', err.message);
          });
      }
    } catch (e: any) {
      console.error('[Camera] Error attaching stream to video element:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('[Camera] camera stopped & tracks released');
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log(`[Camera] Stopped track: ${track.kind} (${track.label})`);
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsActive(false);
  }, [stream]);

  const startCamera = useCallback(async (): Promise<MediaStream | null> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Camera access is not supported in this browser. Please use a modern browser (Chrome, Edge, Firefox, Safari).';
      setError(msg);
      setDeviceNotFound(true);
      return null;
    }

    console.log('[Camera] Camera initialization started');
    setIsInitializing(true);
    setError(null);
    setPermissionDenied(false);
    setDeviceNotFound(false);

    try {
      // 1. Request camera media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false, // audio handled exclusively by speechService
      });

      console.log(`[Camera] stream acquired (${mediaStream.getVideoTracks().length} video tracks)`);

      if (!isMountedRef.current) {
        mediaStream.getTracks().forEach((t) => t.stop());
        return null;
      }

      // Handle unexpected track ending
      mediaStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          console.warn('[Camera] Video track ended unexpectedly');
          setIsActive(false);
          setError('Camera device was disconnected.');
        };
      });

      setStream(mediaStream);
      setIsActive(true);
      setIsInitializing(false);

      // Attach to video element if already rendered
      if (videoRef.current) {
        attachStreamToVideo(mediaStream, videoRef.current);
      }

      return mediaStream;
    } catch (err: any) {
      console.error('[Camera] getUserMedia error:', err.name, err.message);
      setIsInitializing(false);
      setIsActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access in your browser site settings and retry.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setDeviceNotFound(true);
        setError('No camera hardware was detected on your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application. Please close other camera apps and retry.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera does not satisfy required video constraints. Retrying with basic resolution...');
      } else {
        setError(`Camera access error: ${err.message || 'Unknown device error'}`);
      }
      return null;
    }
  }, [attachStreamToVideo]);

  const retryCamera = useCallback(async () => {
    stopCamera();
    await startCamera();
  }, [stopCamera, startCamera]);

  // Effect to attach stream whenever videoRef becomes populated
  useEffect(() => {
    if (stream && videoRef.current) {
      attachStreamToVideo(stream, videoRef.current);
    }
  }, [stream, attachStreamToVideo]);

  // Auto-start on mount if requested
  useEffect(() => {
    isMountedRef.current = true;
    if (autoStart) {
      startCamera();
    }
    return () => {
      isMountedRef.current = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    stream,
    videoRef,
    isInitializing,
    isActive,
    permissionDenied,
    deviceNotFound,
    error,
    startCamera,
    stopCamera,
    retryCamera,
  };
}
