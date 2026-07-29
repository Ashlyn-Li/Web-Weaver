import { CameraPermissionButton } from './CameraPermissionButton'

type LandingViewProps = {
  statusText: string
}

export function LandingView({ statusText }: LandingViewProps) {
  return (
    <section className="landing-view" aria-labelledby="page-title">
      <div className="landing-copy">
        <h1 id="page-title">Web Weaver</h1>
        <p>
          A real-time hand-tracking experience that transforms movement into
          dynamic spider-web geometry.
        </p>
      </div>
      <CameraPermissionButton label="Enable Camera" disabled />
      <p className="landing-status" aria-hidden="true">
        {statusText}
      </p>
    </section>
  )
}
