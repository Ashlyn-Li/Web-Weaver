import { DEBUG } from '../config/debug'
import type {
  HandTrackingStatus,
  HandTrackingSummary,
} from '../types/handTracking'

type TrackingDebugOverlayProps = {
  status: HandTrackingStatus
  summary: HandTrackingSummary
  error?: string | null
}

function getDetectedLabel(isDetected: boolean) {
  return isDetected ? 'detected' : 'not detected'
}

export function TrackingDebugOverlay({
  status,
  summary,
  error,
}: TrackingDebugOverlayProps) {
  if (!DEBUG.enabled || !DEBUG.tracking) {
    return null
  }

  return (
    <aside className="tracking-debug-overlay" aria-label="Hand tracking debug">
      <p>Hands detected: {summary.handCount}</p>
      <p>Left hand: {getDetectedLabel(summary.leftHandDetected)}</p>
      <p>Right hand: {getDetectedLabel(summary.rightHandDetected)}</p>
      <p>Tracking status: {status}</p>
      {error ? <p>{error}</p> : null}
    </aside>
  )
}
