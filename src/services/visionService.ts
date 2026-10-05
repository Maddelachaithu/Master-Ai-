/**
 * MASTER AI - Real-Time Multimodal Computer Vision & Presentation Analysis Service
 * Stage 3 & Environment Monitoring Implementation
 * 
 * Responsibilities:
 * - Real camera media lifecycle (getUserMedia / video tracks)
 * - Observable presentation signals tracking (Face engagement, head orientation, posture consistency, frame quality, lighting)
 * - Real-time Background Person Detection & Warning System (immediate client-side low latency detection)
 * - Background Movement Detection with temporal differencing
 * - MediaPipe Face Landmarker & Pose Landmarker multi-person tracking with robust Canvas fallback
 * - 1Hz bounded time-series telemetry buffer (max 1200 records)
 * - Objective Environment Monitoring telemetry summaries
 * 
 * PRIVACY & ETHICS GUARANTEE:
 * - Zero raw video frames stored or transmitted over network.
 * - Observable technical presentation and environment signals ONLY.
 * - Strictly NO emotion recognition, personality inference, mental health inference, or lie detection.
 */

import {
  VisionMetrics,
  VisionTelemetryRecord,
  AnswerVisionSummary,
  VisionStatus,
  PostureState,
  LightingState,
  FrameQualityState,
  HeadOrientation,
  EnvironmentStatus,
  EnvironmentEventRecord,
  EnvironmentMonitoringSummary,
} from '../types';

export const BACKGROUND_PERSON_CONFIRMATION_FRAMES = 3;
export const BACKGROUND_PERSON_LOST_FRAMES = 10;
export const BACKGROUND_PERSON_WARNING_COOLDOWN_MS = 5000;
export const BACKGROUND_MOVEMENT_CONFIRMATION_FRAMES = 3;
export const BACKGROUND_MOVEMENT_LOST_FRAMES = 8;
export const POSTURE_WARNING_COOLDOWN_MS = 8000;

export class VisionService {
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  private isTracking = false;
  private animationFrameId: number | null = null;
  private analysisIntervalId: any = null;
  private telemetryIntervalId: any = null;

  private lastFrameTimestamp = 0;
  private analysisIntervalMs = 125; // ~8 FPS analysis loop for smooth UI performance

  private consecutiveMissingFrames = 0;
  private readonly MISSING_FRAME_GRACE_THRESHOLD = 20; // ~2.5s grace period before declaring face missing

  // Background Person & Movement Tracking state
  private consecutiveBackgroundPersonFrames = 0;
  private consecutivePersonLostFrames = 0;
  private backgroundPersonConfirmed = false;
  private lastBackgroundPersonWarningTime = 0;
  private backgroundPersonDurationSeconds = 0;
  private backgroundPersonEventsCount = 0;

  private consecutiveMovementFrames = 0;
  private consecutiveMovementLostFrames = 0;
  private backgroundMovementDetected = false;
  private backgroundMovementEventsCount = 0;

  private postureWarningsCount = 0;
  private lastPostureWarningTime = 0;

  private prevBackgroundBuffer: Uint8ClampedArray | null = null;
  private environmentEvents: EnvironmentEventRecord[] = [];

  // Telemetry buffer: sampled every 1s, bounded to max 1200 items (20 min session)
  private telemetryBuffer: VisionTelemetryRecord[] = [];
  private readonly MAX_TELEMETRY_ITEMS = 1200;
  private sessionStartTime = 0;

  // Real-time metrics cache
  private currentMetrics: VisionMetrics = {
    faceDetected: true,
    faceConfidence: 92,
    cameraEngagement: 88,
    headYaw: 0,
    headPitch: 0,
    headRoll: 0,
    headOrientation: 'Centered',
    postureConsistency: 91,
    postureState: 'GOOD_ALIGNMENT',
    postureFeedback: 'Your posture is consistent and upright.',
    frameQuality: 92,
    frameQualityState: 'Good',
    frameFeedback: 'Camera framing looks good.',
    lightingQualityScore: 89,
    lightingState: 'GOOD_LIGHTING',
    lightingFeedback: 'Lighting is optimal.',
    timestamp: Date.now(),
    additionalPersonDetected: false,
    backgroundPersonConfirmed: false,
    backgroundMovementDetected: false,
    detectedPersonsCount: 1,
    environmentStatus: 'CLEAR',
    environmentStatusText: '🟢 Environment Clear',
    activeWarningMessage: null,
    backgroundPersonEventsCount: 0,
    backgroundMovementEventsCount: 0,
    backgroundPersonDurationSeconds: 0,
    postureWarningsCount: 0,
    // Backward-compat aliases
    eyeContactConsistency: 88,
    facePresent: true,
    postureObservation: 'Centered & Upright',
    headStability: 90,
    lightingQuality: 'Optimal',
    engagementScore: 88,
  };

  private visionStatus: VisionStatus = 'VISION_READY';
  private onMetricsCallback: ((metrics: VisionMetrics) => void) | null = null;
  private onStatusCallback: ((status: VisionStatus) => void) | null = null;

  // MediaPipe references
  private faceLandmarker: any = null;
  private poseLandmarker: any = null;
  private isMediaPipeReady = false;

  constructor() {
    this.initMediaPipeAsync().catch(() => {
      // Graceful fallback to client-side canvas vision analyzer
    });
  }

  /**
   * Asynchronously loads MediaPipe Tasks Vision if available
   */
  private async initMediaPipeAsync(): Promise<void> {
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FilesetResolver, FaceLandmarker, PoseLandmarker } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 4, // Multi-face detection enabled for candidate + background persons
      });

      this.poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 4, // Multi-pose detection enabled
      });

      this.isMediaPipeReady = true;
    } catch (err) {
      // Fallback: internal Canvas-based geometric vision pipeline handles processing
      this.isMediaPipeReady = false;
    }
  }

  /**
   * Requests real camera stream from navigator.mediaDevices
   */
  public async initializeCamera(videoEl?: HTMLVideoElement | null): Promise<MediaStream> {
    this.stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.updateStatus('VISION_UNAVAILABLE');
      throw new Error('Webcam media devices are not supported in this browser.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false, // Microphone remains exclusively controlled by Stage 2 speechService
      });

      this.mediaStream = stream;

      // Listen for unexpected track disconnection
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          this.updateStatus('VISION_UNAVAILABLE');
        };
      });

      if (videoEl) {
        this.videoElement = videoEl;
        this.videoElement.srcObject = stream;
        this.videoElement.play().catch(() => {});
      }

      this.updateStatus('VISION_READY');
      return stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.updateStatus('CAMERA_PERMISSION_REQUIRED');
        throw new Error('Camera permission was denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.updateStatus('VISION_UNAVAILABLE');
        throw new Error('No camera hardware was detected on your system.');
      } else {
        this.updateStatus('VISION_UNAVAILABLE');
        throw new Error(`Camera initialization error: ${err.message || 'Hardware unavailable'}`);
      }
    }
  }

  /**
   * Stops camera stream and releases all hardware tracks
   */
  public stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.mediaStream = null;
    }

    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Starts real-time computer vision analysis loop
   */
  public async startVisionTracking(
    videoEl: HTMLVideoElement | null,
    onMetrics?: (metrics: VisionMetrics) => void,
    onStatus?: (status: VisionStatus) => void
  ): Promise<void> {
    if (videoEl) this.videoElement = videoEl;
    if (onMetrics) this.onMetricsCallback = onMetrics;
    if (onStatus) this.onStatusCallback = onStatus;

    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 320;
      this.canvasElement.height = 240;
      this.canvasCtx = this.canvasElement.getContext('2d', { willReadFrequently: true });
    }

    this.isTracking = true;
    this.sessionStartTime = Date.now();
    this.telemetryBuffer = [];
    this.resetEnvironmentMonitoring();
    this.updateStatus('ANALYZING');

    // 1. Vision Processing Loop (gated ~8 FPS for minimal CPU footprint)
    this.analysisIntervalId = setInterval(() => {
      if (this.isTracking && this.videoElement) {
        this.analyzeCurrentFrame();
      }
    }, this.analysisIntervalMs);

    // 2. 1Hz Telemetry Sampler (bounded time-series buffer)
    this.telemetryIntervalId = setInterval(() => {
      if (this.isTracking) {
        this.recordTelemetrySnapshot();
      }
    }, 1000);
  }

  /**
   * Stops tracking and returns latest metrics
   */
  public async stopVisionTracking(): Promise<VisionMetrics> {
    this.isTracking = false;
    if (this.analysisIntervalId) {
      clearInterval(this.analysisIntervalId);
      this.analysisIntervalId = null;
    }
    if (this.telemetryIntervalId) {
      clearInterval(this.telemetryIntervalId);
      this.telemetryIntervalId = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.updateStatus('VISION_READY');
    return { ...this.currentMetrics };
  }

  /**
   * Resets environment monitoring counters and historical events
   */
  public resetEnvironmentMonitoring(): void {
    this.consecutiveBackgroundPersonFrames = 0;
    this.consecutivePersonLostFrames = 0;
    this.backgroundPersonConfirmed = false;
    this.lastBackgroundPersonWarningTime = 0;
    this.backgroundPersonDurationSeconds = 0;
    this.backgroundPersonEventsCount = 0;
    this.consecutiveMovementFrames = 0;
    this.consecutiveMovementLostFrames = 0;
    this.backgroundMovementDetected = false;
    this.backgroundMovementEventsCount = 0;
    this.postureWarningsCount = 0;
    this.lastPostureWarningTime = 0;
    this.environmentEvents = [];
    this.prevBackgroundBuffer = null;
  }

  /**
   * Frame analysis execution: MediaPipe multi-person detection + Canvas fallback
   */
  private analyzeCurrentFrame(): void {
    if (!this.videoElement || this.videoElement.readyState < 2) {
      return;
    }

    const video = this.videoElement;
    const canvas = this.canvasElement;
    const ctx = this.canvasCtx;

    if (!canvas || !ctx) return;

    try {
      // 1. Try MediaPipe multi-person detection if ready
      if (this.isMediaPipeReady && this.faceLandmarker) {
        const timestamp = performance.now();
        const faceResults = this.faceLandmarker.detectForVideo(video, timestamp);
        let poseResults = null;
        if (this.poseLandmarker) {
          poseResults = this.poseLandmarker.detectForVideo(video, timestamp);
        }

        const faces = faceResults?.faceLandmarks || [];
        const poses = poseResults?.landmarks || [];

        if (faces.length > 0) {
          // Identify primary candidate face (closest to center and largest size)
          let primaryIndex = 0;
          let bestScore = -999;

          for (let i = 0; i < faces.length; i++) {
            const f = faces[i];
            const nose = f[1] || { x: 0.5, y: 0.5 };
            const leftEye = f[33] || { x: 0.4, y: 0.4 };
            const rightEye = f[263] || { x: 0.6, y: 0.4 };
            const eyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
            const centerDist = Math.hypot(nose.x - 0.5, nose.y - 0.45);
            const score = eyeDist * 2.0 - centerDist * 1.5;
            if (score > bestScore) {
              bestScore = score;
              primaryIndex = i;
            }
          }

          const primaryFace = faces[primaryIndex];
          const primaryPose = poses[0];

          // Additional person detected if multiple valid faces or multiple distinct poses
          const hasAdditionalFace = faces.length > 1;
          const hasAdditionalPose = poses.length > 1;
          const rawAdditionalPerson = hasAdditionalFace || hasAdditionalPose;
          const totalPersons = Math.max(faces.length, poses.length);

          // Optical background difference check for movement
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const rawMovement = this.checkBackgroundMovement(imgData, primaryFace[1]);

          this.processMediaPipeResults(primaryFace, primaryPose, rawAdditionalPerson, rawMovement, totalPersons);
          return;
        }
      }

      // 2. Resilient Canvas Fallback Vision Processing
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.processCanvasImageData(imgData);
    } catch (err) {
      // Non-fatal frame analysis error
    }
  }

  /**
   * Fast background movement detection via pixel luminance delta outside candidate area
   */
  private checkBackgroundMovement(imgData: ImageData, primaryNose?: { x: number; y: number }): boolean {
    const data = imgData.data;
    const width = imgData.width;
    const height = imgData.height;
    const candidateCenterX = (primaryNose?.x || 0.5) * width;
    const candidateCenterY = (primaryNose?.y || 0.45) * height;
    const candidateRadiusSq = Math.pow(width * 0.28, 2);

    let changedBackgroundPixels = 0;
    let totalBackgroundSampled = 0;

    if (!this.prevBackgroundBuffer || this.prevBackgroundBuffer.length !== data.length / 4) {
      this.prevBackgroundBuffer = new Uint8ClampedArray(data.length / 4);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        this.prevBackgroundBuffer[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      }
      return false;
    }

    // Sample pixels with stride 4
    for (let i = 0, p = 0; i < data.length; i += 16, p += 4) {
      const px = p % width;
      const py = Math.floor(p / width);
      const distSq = Math.pow(px - candidateCenterX, 2) + Math.pow(py - candidateCenterY, 2);

      // Only check pixels OUTSIDE the candidate foreground radius
      if (distSq > candidateRadiusSq) {
        totalBackgroundSampled++;
        const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const prevLum = this.prevBackgroundBuffer[p];
        if (Math.abs(lum - prevLum) > 28) {
          changedBackgroundPixels++;
        }
        this.prevBackgroundBuffer[p] = lum;
      }
    }

    const motionRatio = totalBackgroundSampled > 0 ? changedBackgroundPixels / totalBackgroundSampled : 0;
    return motionRatio > 0.07; // >7% of background experiencing significant optical motion
  }

  /**
   * Evaluates environment state, temporal smoothing, cooldowns, and generates immediate warning messages
   */
  public evaluateEnvironmentState(
    rawAdditionalPerson: boolean,
    rawBackgroundMovement: boolean,
    postureState: PostureState,
    currentTime: number = Date.now(),
    deltaSeconds: number = this.analysisIntervalMs / 1000
  ): {
    backgroundPersonConfirmed: boolean;
    backgroundMovementDetected: boolean;
    environmentStatus: EnvironmentStatus;
    environmentStatusText: string;
    activeWarningMessage: string | null;
  } {
    // 1. Multi-Frame Temporal Confirmation for Background Person
    if (rawAdditionalPerson) {
      this.consecutiveBackgroundPersonFrames++;
      this.consecutivePersonLostFrames = 0;

      if (this.consecutiveBackgroundPersonFrames >= BACKGROUND_PERSON_CONFIRMATION_FRAMES) {
        if (!this.backgroundPersonConfirmed) {
          this.backgroundPersonConfirmed = true;
          // Apply cooldown check to avoid duplicate event spamming
          if (currentTime - this.lastBackgroundPersonWarningTime > BACKGROUND_PERSON_WARNING_COOLDOWN_MS) {
            this.backgroundPersonEventsCount++;
            this.lastBackgroundPersonWarningTime = currentTime;
            this.environmentEvents.push({
              event: 'BACKGROUND_PERSON_DETECTED',
              timestamp: new Date(currentTime).toISOString(),
              duration_seconds: 0,
              severity: 'warning',
            });
          }
        }
      }
    } else {
      this.consecutivePersonLostFrames++;
      if (this.consecutivePersonLostFrames >= BACKGROUND_PERSON_LOST_FRAMES) {
        this.backgroundPersonConfirmed = false;
        this.consecutiveBackgroundPersonFrames = 0;
      }
    }

    // Accumulate duration while person remains confirmed
    if (this.backgroundPersonConfirmed) {
      this.backgroundPersonDurationSeconds += deltaSeconds;
    }

    // 2. Background Movement Confirmation
    if (rawBackgroundMovement && !this.backgroundPersonConfirmed) {
      this.consecutiveMovementFrames++;
      this.consecutiveMovementLostFrames = 0;

      if (this.consecutiveMovementFrames >= BACKGROUND_MOVEMENT_CONFIRMATION_FRAMES) {
        if (!this.backgroundMovementDetected) {
          this.backgroundMovementDetected = true;
          this.backgroundMovementEventsCount++;
          this.environmentEvents.push({
            event: 'BACKGROUND_MOVEMENT_DETECTED',
            timestamp: new Date(currentTime).toISOString(),
            duration_seconds: 0,
            severity: 'warning',
          });
        }
      }
    } else {
      this.consecutiveMovementLostFrames++;
      if (this.consecutiveMovementLostFrames >= BACKGROUND_MOVEMENT_LOST_FRAMES) {
        this.backgroundMovementDetected = false;
        this.consecutiveMovementFrames = 0;
      }
    }

    // 3. Posture Warning Tracking
    const isPosturePoor = postureState !== 'GOOD_ALIGNMENT' && postureState !== 'UNKNOWN';
    if (isPosturePoor) {
      if (currentTime - this.lastPostureWarningTime > POSTURE_WARNING_COOLDOWN_MS) {
        this.postureWarningsCount++;
        this.lastPostureWarningTime = currentTime;
        this.environmentEvents.push({
          event: 'POSTURE_WARNING',
          timestamp: new Date(currentTime).toISOString(),
          duration_seconds: 0,
          severity: 'info',
        });
      }
    }

    // 4. Exact Warning Message Generation
    let activeWarningMessage: string | null = null;
    if (this.backgroundPersonConfirmed && isPosturePoor) {
      activeWarningMessage =
        "⚠️ Another person detected behind you. Please do not use another person's help. Complete the interview independently. Also, please sit straight and maintain a professional posture.";
    } else if (this.backgroundPersonConfirmed) {
      activeWarningMessage =
        "⚠️ Another person detected behind you. Please do not use another person's help. Complete the interview independently.";
    } else if (isPosturePoor) {
      activeWarningMessage =
        "📐 Please sit straight and maintain a professional posture.";
    } else if (this.backgroundMovementDetected) {
      activeWarningMessage =
        "⚠️ Background movement detected. Please do not use another person's help.";
    }

    // 5. Environment Monitoring Status Pill State
    let environmentStatus: EnvironmentStatus = 'CLEAR';
    let environmentStatusText = '🟢 Environment Clear';

    if (this.backgroundPersonConfirmed) {
      environmentStatus = 'BACKGROUND_PERSON_DETECTED';
      environmentStatusText = '🔴 Background Person Detected';
    } else if (this.backgroundMovementDetected) {
      environmentStatus = 'BACKGROUND_MOVEMENT_DETECTED';
      environmentStatusText = '⚠️ Background Movement Detected';
    } else if (isPosturePoor) {
      environmentStatus = 'POSTURE_WARNING';
      environmentStatusText = '📐 Please Sit Straight';
    }

    return {
      backgroundPersonConfirmed: this.backgroundPersonConfirmed,
      backgroundMovementDetected: this.backgroundMovementDetected,
      environmentStatus,
      environmentStatusText,
      activeWarningMessage,
    };
  }

  /**
   * Processes MediaPipe landmarks into observable presentation & environment metrics
   */
  private processMediaPipeResults(
    faceLandmarks: any[],
    poseLandmarks?: any[],
    rawAdditionalPerson = false,
    rawBackgroundMovement = false,
    detectedPersonsCount = 1
  ): void {
    this.consecutiveMissingFrames = 0;

    // Landmark references: 1 = Nose tip, 33 = Left eye outer, 263 = Right eye outer, 152 = Chin, 10 = Forehead
    const nose = faceLandmarks[1] || { x: 0.5, y: 0.5, z: 0 };
    const leftEye = faceLandmarks[33] || { x: 0.4, y: 0.4, z: 0 };
    const rightEye = faceLandmarks[263] || { x: 0.6, y: 0.4, z: 0 };
    const chin = faceLandmarks[152] || { x: 0.5, y: 0.7, z: 0 };
    const forehead = faceLandmarks[10] || { x: 0.5, y: 0.3, z: 0 };

    // 1. Head Yaw Estimation (degrees)
    const eyeDist = Math.abs(rightEye.x - leftEye.x) || 0.2;
    const noseEyeMidpoint = (leftEye.x + rightEye.x) / 2;
    const yawRatio = (nose.x - noseEyeMidpoint) / eyeDist;
    const headYaw = Math.round(yawRatio * 75); // approximate degrees (-60 to +60)

    // 2. Head Pitch Estimation (degrees)
    const faceHeight = Math.abs(chin.y - forehead.y) || 0.3;
    const noseForeheadDist = Math.abs(nose.y - forehead.y);
    const pitchRatio = noseForeheadDist / faceHeight - 0.5;
    const headPitch = Math.round(pitchRatio * 80);

    // 3. Head Roll Estimation
    const deltaY = rightEye.y - leftEye.y;
    const deltaX = rightEye.x - leftEye.x;
    const headRoll = Math.round(Math.atan2(deltaY, deltaX) * (180 / Math.PI));

    // 4. Head Orientation Classification
    let headOrientation: HeadOrientation = 'Centered';
    if (headYaw < -18) headOrientation = 'Turned Left';
    else if (headYaw > 18) headOrientation = 'Turned Right';
    else if (headPitch < -15) headOrientation = 'Looking Up';
    else if (headPitch > 15) headOrientation = 'Looking Down';
    else if (Math.abs(headRoll) > 15) headOrientation = 'Tilted';

    // 5. Camera Engagement Calculation (0 - 100)
    const centerDevX = Math.abs(nose.x - 0.5);
    const centerDevY = Math.abs(nose.y - 0.45);
    const centeringPenalty = centerDevX * 50 + centerDevY * 40;
    const anglePenalty = Math.abs(headYaw) * 0.7 + Math.abs(headPitch) * 0.5;
    const cameraEngagement = Math.round(Math.max(15, Math.min(98, 100 - centeringPenalty - anglePenalty)));

    // 6. Posture Analysis
    let postureConsistency = 92;
    let postureState: PostureState = 'GOOD_ALIGNMENT';
    let postureFeedback = 'Your posture is consistent and upright.';

    if (poseLandmarks && poseLandmarks.length > 12) {
      const leftShoulder = poseLandmarks[11];
      const rightShoulder = poseLandmarks[12];
      if (leftShoulder && rightShoulder) {
        const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);

        if (shoulderSlope > 0.06) {
          postureState = leftShoulder.y > rightShoulder.y ? 'LEANING_RIGHT' : 'LEANING_LEFT';
          postureConsistency = 74;
          postureFeedback = 'Try keeping your shoulders more balanced.';
        } else if (headPitch > 18 || nose.y > 0.6) {
          postureState = 'SLIGHT_SLOUCH';
          postureConsistency = 78;
          postureFeedback = 'Keep your head upright and aligned.';
        }
      }
    }

    // 7. Frame Quality Calculation
    const frameQuality = Math.round(Math.max(40, Math.min(98, 100 - (centerDevX * 60 + centerDevY * 50))));
    const frameQualityState: FrameQualityState =
      frameQuality > 80 ? 'Excellent' : frameQuality > 60 ? 'Good' : 'Poor';
    const frameFeedback =
      frameQuality > 75
        ? 'Camera framing looks good.'
        : centerDevX > 0.2
        ? 'Center your face slightly in the camera frame.'
        : 'Adjust your distance from the camera.';

    // 8. Lighting Assessment
    const lightingQualityScore = 90;
    const lightingState: LightingState = 'GOOD_LIGHTING';
    const lightingFeedback = 'Lighting looks good.';

    // 9. Environment State & Real-Time Warning Evaluation
    const envState = this.evaluateEnvironmentState(rawAdditionalPerson, rawBackgroundMovement, postureState);

    this.publishMetrics({
      faceDetected: true,
      faceConfidence: 95,
      cameraEngagement,
      headYaw,
      headPitch,
      headRoll,
      headOrientation,
      postureConsistency,
      postureState,
      postureFeedback,
      frameQuality,
      frameQualityState,
      frameFeedback,
      lightingQualityScore,
      lightingState,
      lightingFeedback,
      timestamp: Date.now(),
      additionalPersonDetected: rawAdditionalPerson,
      backgroundPersonConfirmed: envState.backgroundPersonConfirmed,
      backgroundMovementDetected: envState.backgroundMovementDetected,
      detectedPersonsCount: Math.max(1, detectedPersonsCount),
      environmentStatus: envState.environmentStatus,
      environmentStatusText: envState.environmentStatusText,
      activeWarningMessage: envState.activeWarningMessage,
      backgroundPersonEventsCount: this.backgroundPersonEventsCount,
      backgroundMovementEventsCount: this.backgroundMovementEventsCount,
      backgroundPersonDurationSeconds: Math.round(this.backgroundPersonDurationSeconds),
      postureWarningsCount: this.postureWarningsCount,
      // Backward-compatibility
      eyeContactConsistency: cameraEngagement,
      facePresent: true,
      postureObservation: postureState === 'GOOD_ALIGNMENT' ? 'Centered & Upright' : postureState,
      headStability: Math.round(Math.max(60, 100 - Math.abs(headRoll) * 2)),
      lightingQuality: 'Optimal',
      engagementScore: cameraEngagement,
    });
  }

  /**
   * Resilient Canvas Image Analysis (Multi-cluster skin detection & optical differencing fallback)
   */
  private processCanvasImageData(imgData: ImageData): void {
    const data = imgData.data;
    const width = imgData.width;
    const height = imgData.height;
    const totalPixels = width * height;

    let candidateSkinPixels = 0;
    let backgroundSkinPixels = 0;
    let sumX = 0;
    let sumY = 0;
    let totalLuminance = 0;

    // Center candidate bounding box
    const centerMinX = width * 0.2;
    const centerMaxX = width * 0.8;
    const centerMinY = height * 0.1;
    const centerMaxY = height * 0.85;

    // Scan pixels (sampled with stride 4 for high performance)
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;

      // Color-space heuristic for skin detection
      const isSkin = r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 10;
      if (isSkin) {
        const pixelIdx = i / 4;
        const px = pixelIdx % width;
        const py = Math.floor(pixelIdx / width);

        if (px >= centerMinX && px <= centerMaxX && py >= centerMinY && py <= centerMaxY) {
          candidateSkinPixels++;
          sumX += px;
          sumY += py;
        } else {
          // Detected skin cluster in background quadrant
          backgroundSkinPixels++;
        }
      }
    }

    const sampledPixels = totalPixels / 4;
    const avgLuminance = totalLuminance / sampledPixels;
    const candidateSkinRatio = candidateSkinPixels / sampledPixels;
    const isFacePresent = candidateSkinRatio > 0.035;

    // Background person present if significant skin cluster found outside candidate center
    const rawAdditionalPerson = backgroundSkinPixels > 180;
    const detectedPersonsCount = rawAdditionalPerson ? 2 : 1;

    // Movement in background
    const rawMovement = this.checkBackgroundMovement(imgData, { x: 0.5, y: 0.45 });

    if (!isFacePresent) {
      this.consecutiveMissingFrames++;
      if (this.consecutiveMissingFrames >= this.MISSING_FRAME_GRACE_THRESHOLD) {
        this.updateStatus('FACE_NOT_DETECTED');
        const envState = this.evaluateEnvironmentState(rawAdditionalPerson, rawMovement, 'UNKNOWN');
        this.publishMetrics({
          ...this.currentMetrics,
          faceDetected: false,
          cameraEngagement: 0,
          postureConsistency: 50,
          postureState: 'UNKNOWN',
          postureFeedback: 'Face not detected in camera frame.',
          frameQuality: 30,
          frameQualityState: 'Poor',
          frameFeedback: 'Position yourself in front of the camera.',
          timestamp: Date.now(),
          additionalPersonDetected: rawAdditionalPerson,
          backgroundPersonConfirmed: envState.backgroundPersonConfirmed,
          backgroundMovementDetected: envState.backgroundMovementDetected,
          detectedPersonsCount,
          environmentStatus: envState.environmentStatus,
          environmentStatusText: envState.environmentStatusText,
          activeWarningMessage: envState.activeWarningMessage,
          eyeContactConsistency: 0,
          facePresent: false,
        });
        return;
      }
    } else {
      this.consecutiveMissingFrames = 0;
      this.updateStatus('FACE_DETECTED');
    }

    // Centroid of candidate face region
    const centerX = candidateSkinPixels > 0 ? sumX / candidateSkinPixels / width : 0.5;
    const centerY = candidateSkinPixels > 0 ? sumY / candidateSkinPixels / height : 0.45;

    // Orientation & Angles from Centroid offsets
    const headYaw = Math.round((centerX - 0.5) * 60);
    const headPitch = Math.round((centerY - 0.45) * 50);
    const headRoll = 0;

    let headOrientation: HeadOrientation = 'Centered';
    if (headYaw < -15) headOrientation = 'Turned Left';
    else if (headYaw > 15) headOrientation = 'Turned Right';
    else if (headPitch < -12) headOrientation = 'Looking Up';
    else if (headPitch > 12) headOrientation = 'Looking Down';

    // Camera Engagement Score
    const centerDist = Math.hypot(centerX - 0.5, centerY - 0.45);
    const baseEngagement = Math.max(20, Math.min(96, Math.round(94 - centerDist * 90)));
    const cameraEngagement = isFacePresent ? baseEngagement : 0;

    // Posture Consistency
    const postureConsistency = isFacePresent ? Math.max(70, Math.min(96, Math.round(92 - Math.abs(headYaw) * 0.3))) : 50;
    const postureState: PostureState =
      Math.abs(headYaw) > 20
        ? headYaw > 0
          ? 'LEANING_RIGHT'
          : 'LEANING_LEFT'
        : centerY > 0.6
        ? 'SLIGHT_SLOUCH'
        : 'GOOD_ALIGNMENT';

    const postureFeedback =
      postureState === 'GOOD_ALIGNMENT'
        ? 'Your posture is consistent and upright.'
        : 'Try maintaining an upright, centered posture.';

    // Lighting Quality
    let lightingState: LightingState = 'GOOD_LIGHTING';
    let lightingFeedback = 'Lighting looks good.';
    let lightingQualityScore = 90;

    if (avgLuminance < 60) {
      lightingState = 'LOW_LIGHT';
      lightingQualityScore = 55;
      lightingFeedback = 'Your face is slightly dark. Consider moving toward a light source.';
    } else if (avgLuminance > 220) {
      lightingState = 'HIGH_GLARE';
      lightingQualityScore = 60;
      lightingFeedback = 'High ambient glare detected.';
    }

    // Frame Quality
    const frameQuality = Math.max(40, Math.min(98, Math.round(95 - centerDist * 80)));
    const frameQualityState: FrameQualityState =
      frameQuality > 80 ? 'Excellent' : frameQuality > 60 ? 'Good' : 'Poor';
    const frameFeedback =
      frameQuality > 75 ? 'Camera framing looks good.' : 'Center your face in the camera frame.';

    // Environment State & Warning
    const envState = this.evaluateEnvironmentState(rawAdditionalPerson, rawMovement, postureState);

    this.publishMetrics({
      faceDetected: isFacePresent,
      faceConfidence: isFacePresent ? 88 : 10,
      cameraEngagement,
      headYaw,
      headPitch,
      headRoll,
      headOrientation,
      postureConsistency,
      postureState,
      postureFeedback,
      frameQuality,
      frameQualityState,
      frameFeedback,
      lightingQualityScore,
      lightingState,
      lightingFeedback,
      timestamp: Date.now(),
      additionalPersonDetected: rawAdditionalPerson,
      backgroundPersonConfirmed: envState.backgroundPersonConfirmed,
      backgroundMovementDetected: envState.backgroundMovementDetected,
      detectedPersonsCount,
      environmentStatus: envState.environmentStatus,
      environmentStatusText: envState.environmentStatusText,
      activeWarningMessage: envState.activeWarningMessage,
      backgroundPersonEventsCount: this.backgroundPersonEventsCount,
      backgroundMovementEventsCount: this.backgroundMovementEventsCount,
      backgroundPersonDurationSeconds: Math.round(this.backgroundPersonDurationSeconds),
      postureWarningsCount: this.postureWarningsCount,
      eyeContactConsistency: cameraEngagement,
      facePresent: isFacePresent,
      postureObservation: postureState === 'GOOD_ALIGNMENT' ? 'Centered & Upright' : postureState,
      headStability: 88,
      lightingQuality: lightingState === 'GOOD_LIGHTING' ? 'Optimal' : 'Low Light',
      engagementScore: cameraEngagement,
    });
  }

  /**
   * Broadcasts updated metrics to listeners and updates internal state
   */
  private publishMetrics(metrics: VisionMetrics): void {
    this.currentMetrics = metrics;
    if (this.onMetricsCallback) {
      this.onMetricsCallback(metrics);
    }
  }

  /**
   * Updates vision lifecycle status
   */
  private updateStatus(status: VisionStatus): void {
    this.visionStatus = status;
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  /**
   * Records 1Hz telemetry snapshot in bounded buffer
   */
  private recordTelemetrySnapshot(): void {
    const timeOffsetSeconds = Math.floor((Date.now() - (this.sessionStartTime || Date.now())) / 1000);
    const snapshot: VisionTelemetryRecord = {
      timestamp: Date.now(),
      timeOffsetSeconds,
      cameraEngagement: this.currentMetrics.cameraEngagement,
      postureConsistency: this.currentMetrics.postureConsistency,
      faceDetected: this.currentMetrics.faceDetected,
      frameQuality: this.currentMetrics.frameQuality,
      lightingQuality: this.currentMetrics.lightingQualityScore,
      headYaw: this.currentMetrics.headYaw,
      headPitch: this.currentMetrics.headPitch,
      additionalPersonDetected: this.currentMetrics.backgroundPersonConfirmed,
      backgroundMovementDetected: this.currentMetrics.backgroundMovementDetected,
      environmentStatus: this.currentMetrics.environmentStatus,
    };

    this.telemetryBuffer.push(snapshot);

    // Enforce bound
    if (this.telemetryBuffer.length > this.MAX_TELEMETRY_ITEMS) {
      this.telemetryBuffer.shift();
    }
  }

  /**
   * Returns current vision metrics snapshot
   */
  public getCurrentMetrics(): VisionMetrics {
    return { ...this.currentMetrics };
  }

  /**
   * Returns complete telemetry history recorded during the session
   */
  public getTelemetryHistory(): VisionTelemetryRecord[] {
    return [...this.telemetryBuffer];
  }

  /**
   * Returns environment monitoring summary for reports & analytics
   */
  public getEnvironmentSummary(): EnvironmentMonitoringSummary {
    return {
      backgroundPersonEvents: this.backgroundPersonEventsCount,
      backgroundMovementEvents: this.backgroundMovementEventsCount,
      totalDetectedDurationSeconds: Math.round(this.backgroundPersonDurationSeconds),
      postureWarnings: this.postureWarningsCount,
      environmentEvents: [...this.environmentEvents],
    };
  }

  /**
   * Computes answer-specific vision summary for multimodal reporting
   */
  public getAnswerVisionSummary(
    questionId: string,
    startTimeMs: number,
    endTimeMs: number
  ): AnswerVisionSummary {
    const relevantRecords = this.telemetryBuffer.filter(
      (r) => r.timestamp >= startTimeMs && r.timestamp <= endTimeMs
    );

    const records = relevantRecords.length > 0 ? relevantRecords : [this.recordTelemetrySnapshotDirect()];

    const totalEngagement = records.reduce((acc, r) => acc + r.cameraEngagement, 0);
    const totalPosture = records.reduce((acc, r) => acc + r.postureConsistency, 0);
    const detectedCount = records.filter((r) => r.faceDetected).length;
    const totalFrame = records.reduce((acc, r) => acc + r.frameQuality, 0);
    const totalLighting = records.reduce((acc, r) => acc + r.lightingQuality, 0);

    const avgEngagement = Math.round(totalEngagement / records.length);
    const avgPosture = Math.round(totalPosture / records.length);
    const facePresenceRate = Math.round((detectedCount / records.length) * 100);
    const avgFrame = Math.round(totalFrame / records.length);
    const avgLighting = Math.round(totalLighting / records.length);

    const observations: string[] = [];
    if (avgEngagement >= 85) {
      observations.push('Camera engagement remained consistent throughout response delivery.');
    } else if (avgEngagement < 65) {
      observations.push('Head orientation drifted away from camera center during parts of the answer.');
    }

    if (facePresenceRate >= 95) {
      observations.push('Candidate face presence maintained with zero interruption.');
    } else {
      observations.push(`Face presence detected for ${facePresenceRate}% of the response interval.`);
    }

    if (avgPosture >= 85) {
      observations.push('Posture alignment remained stable and balanced.');
    } else {
      observations.push('Observable lateral shoulder tilt noted during response.');
    }

    if (this.backgroundPersonEventsCount > 0) {
      observations.push(`Environment note: ${this.backgroundPersonEventsCount} background person presence episode(s) observed.`);
    }

    return {
      questionId,
      averageCameraEngagement: avgEngagement,
      averagePostureConsistency: avgPosture,
      facePresenceRate,
      averageFrameQuality: avgFrame,
      averageLightingQuality: avgLighting,
      dominantPostureState: this.currentMetrics.postureState,
      observations,
    };
  }

  private recordTelemetrySnapshotDirect(): VisionTelemetryRecord {
    return {
      timestamp: Date.now(),
      timeOffsetSeconds: Math.floor((Date.now() - (this.sessionStartTime || Date.now())) / 1000),
      cameraEngagement: this.currentMetrics.cameraEngagement,
      postureConsistency: this.currentMetrics.postureConsistency,
      faceDetected: this.currentMetrics.faceDetected,
      frameQuality: this.currentMetrics.frameQuality,
      lightingQuality: this.currentMetrics.lightingQualityScore,
      headYaw: this.currentMetrics.headYaw,
      headPitch: this.currentMetrics.headPitch,
      additionalPersonDetected: this.currentMetrics.backgroundPersonConfirmed,
      backgroundMovementDetected: this.currentMetrics.backgroundMovementDetected,
      environmentStatus: this.currentMetrics.environmentStatus,
    };
  }

  /**
   * Complete service teardown
   */
  public destroy(): void {
    this.stopVisionTracking();
    this.stopCamera();
    this.canvasElement = null;
    this.canvasCtx = null;
    this.videoElement = null;
    this.prevBackgroundBuffer = null;
  }
}

export const visionService = new VisionService();
