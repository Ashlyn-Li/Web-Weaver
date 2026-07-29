import { DEBUG } from '../config/debug'
import type { FingerState, Point3D, ProcessedHand } from '../types/hand'

type HandProcessingOverlayProps = {
  hands: readonly ProcessedHand[]
}

function formatPoint(point: Point3D) {
  return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`
}

function formatFinger(finger: FingerState) {
  return finger.extended ? 'Extended' : 'Folded'
}

export function HandProcessingOverlay({ hands }: HandProcessingOverlayProps) {
  if (!DEBUG.enabled || !DEBUG.handProcessing) {
    return null
  }

  return (
    <aside className="hand-processing-overlay" aria-label="Hand processing debug">
      {hands.length === 0 ? <p>No processed hands</p> : null}
      {hands.map((hand) => (
        <div className="hand-processing-card" key={hand.id}>
          <p>{hand.handedness} Hand</p>
          <p>Palm centre: {formatPoint(hand.palmCenter)}</p>
          <p>Palm normal: {formatPoint(hand.palmNormal)}</p>
          <p>Hand scale: {hand.handScale.toFixed(3)}</p>
          <p>Thumb: {formatFinger(hand.fingerStates.thumb)}</p>
          <p>Index: {formatFinger(hand.fingerStates.index)}</p>
          <p>Middle: {formatFinger(hand.fingerStates.middle)}</p>
          <p>Ring: {formatFinger(hand.fingerStates.ring)}</p>
          <p>Little: {formatFinger(hand.fingerStates.little)}</p>
        </div>
      ))}
    </aside>
  )
}
