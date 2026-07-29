import { CameraPermissionButton } from './CameraPermissionButton'

type LandingViewProps = {
  buttonDisabled: boolean
  buttonLabel: string
  isCameraActive: boolean
  onCameraButtonClick: () => void
  statusText: string
}

export function LandingView({
  buttonDisabled,
  buttonLabel,
  isCameraActive,
  onCameraButtonClick,
  statusText,
}: LandingViewProps) {
  return (
    <section
      className={`landing-view${isCameraActive ? ' landing-view--active' : ''}`}
      aria-labelledby="page-title"
    >
      <div className="landing-copy">
        <h1 id="page-title">Web Weaver</h1>
        <p>
          A real-time hand-tracking experience that transforms movement into
          dynamic spider-web geometry.
        </p>
      </div>
      <CameraPermissionButton
        label={buttonLabel}
        disabled={buttonDisabled}
        onClick={onCameraButtonClick}
      />
      <p className="landing-status" aria-hidden="true">
        {statusText}
      </p>
    </section>
  )
}
