import { useMemo, useRef } from 'react'
import { CameraSelector } from './CameraSelector'
import { CameraView } from './CameraView'
import { GraphicsCanvas } from './GraphicsCanvas'
import { LandingView } from './LandingView'
import { StatusIndicator } from './StatusIndicator'
import { TrackingDebugOverlay } from './TrackingDebugOverlay'
import { DEBUG } from '../config/debug'
import type { ApplicationPhase } from '../types/application'
import type { CameraStatus } from '../types/camera'
import type {
  HandTrackingStatus,
  HandTrackingSummary,
} from '../types/handTracking'
import { useCamera } from '../hooks/useCamera'
import { useHandTracking } from '../hooks/useHandTracking'
import { useLandmarkRenderer } from '../hooks/useLandmarkRenderer'

function getButtonLabel(status: CameraStatus) {
  switch (status) {
    case 'requesting':
      return 'Requesting Camera...'
    case 'active':
      return 'Camera Enabled'
    case 'denied':
    case 'error':
    case 'unavailable':
      return 'Try Again'
    case 'idle':
      return 'Enable Camera'
  }
}

function getCameraStatusText(status: CameraStatus, error: string | null) {
  switch (status) {
    case 'idle':
      return 'Phase 4: Camera ready to initialise'
    case 'requesting':
      return 'Requesting camera permission...'
    case 'active':
      return 'Camera active'
    case 'denied':
      return 'Camera permission was denied'
    case 'unavailable':
      return error ?? 'No compatible camera was found'
    case 'error':
      return error ?? 'Unable to start the camera'
  }
}

function getTrackingStatusText(
  status: HandTrackingStatus,
  summary: HandTrackingSummary,
  error: string | null,
) {
  switch (status) {
    case 'idle':
      return 'Camera active'
    case 'loading-model':
      return 'Camera active, loading hand-tracking model...'
    case 'ready':
      return summary.handCount === 0 ? 'No hands detected' : 'Hand tracking ready'
    case 'tracking':
      if (summary.handCount === 1) {
        return 'One hand detected'
      }

      if (summary.handCount >= 2) {
        return 'Two hands detected'
      }

      return 'No hands detected'
    case 'error':
      return error ?? 'Unable to initialise hand tracking'
  }
}

function getApplicationPhase(status: CameraStatus): ApplicationPhase {
  switch (status) {
    case 'requesting':
      return 'requesting-camera'
    case 'active':
      return 'camera-active'
    case 'denied':
    case 'unavailable':
    case 'error':
      return 'error'
    case 'idle':
      return 'ready'
  }
}

export function ExperienceShell() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const {
    devices,
    selectedDeviceId,
    stream,
    status,
    error,
    startCamera,
    stopCamera,
    selectCamera,
  } = useCamera()
  const phase = getApplicationPhase(status)
  const isCameraActive = status === 'active' && stream !== null
  const handTracking = useHandTracking(videoRef, isCameraActive)
  const landmarkRenderingEnabled =
    isCameraActive && DEBUG.enabled && DEBUG.landmarks
  useLandmarkRenderer(
    canvasRef,
    videoRef,
    handTracking.latestResultRef,
    landmarkRenderingEnabled,
    true,
  )
  const statusText = useMemo(() => {
    if (isCameraActive) {
      return getTrackingStatusText(
        handTracking.status,
        handTracking.summary,
        handTracking.error,
      )
    }

    return getCameraStatusText(status, error)
  }, [
    error,
    handTracking.error,
    handTracking.status,
    handTracking.summary,
    isCameraActive,
    status,
  ])
  const buttonLabel = getButtonLabel(status)
  const buttonDisabled = status === 'requesting' || status === 'active'

  return (
    <main className="experience-shell" data-phase={phase}>
      <div className="experience-layer experience-layer--camera">
        {isCameraActive ? <CameraView ref={videoRef} stream={stream} /> : null}
      </div>
      <div className="experience-layer experience-layer--graphics" aria-hidden="true">
        {isCameraActive ? <GraphicsCanvas ref={canvasRef} /> : null}
      </div>
      <div className="experience-layer experience-layer--interface">
        <LandingView
          buttonDisabled={buttonDisabled}
          buttonLabel={buttonLabel}
          isCameraActive={isCameraActive}
          onCameraButtonClick={() => {
            void startCamera()
          }}
          statusText={statusText}
        />
        {isCameraActive ? (
          <div className="camera-controls" aria-label="Camera controls">
            <CameraSelector
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelectCamera={(deviceId) => {
                void selectCamera(deviceId)
              }}
            />
            <button type="button" className="secondary-camera-button" onClick={stopCamera}>
              Disable Camera
            </button>
          </div>
        ) : null}
        {isCameraActive ? (
          <TrackingDebugOverlay
            status={handTracking.status}
            summary={handTracking.summary}
            error={handTracking.error}
          />
        ) : null}
      </div>
      <div className="experience-layer experience-layer--status">
        <StatusIndicator text={statusText} />
      </div>
    </main>
  )
}
