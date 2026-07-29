import { useMemo } from 'react'
import { CameraSelector } from './CameraSelector'
import { CameraView } from './CameraView'
import { LandingView } from './LandingView'
import { StatusIndicator } from './StatusIndicator'
import type { ApplicationPhase } from '../types/application'
import type { CameraStatus } from '../types/camera'
import { useCamera } from '../hooks/useCamera'

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

function getStatusText(status: CameraStatus, error: string | null) {
  switch (status) {
    case 'idle':
      return 'Phase 3: Camera ready to initialise'
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
  const statusText = useMemo(() => getStatusText(status, error), [error, status])
  const buttonLabel = getButtonLabel(status)
  const buttonDisabled = status === 'requesting' || status === 'active'

  return (
    <main className="experience-shell" data-phase={phase}>
      <div className="experience-layer experience-layer--camera">
        {isCameraActive ? <CameraView stream={stream} /> : null}
      </div>
      <div className="experience-layer experience-layer--graphics" aria-hidden="true" />
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
      </div>
      <div className="experience-layer experience-layer--status">
        <StatusIndicator text={statusText} />
      </div>
    </main>
  )
}
