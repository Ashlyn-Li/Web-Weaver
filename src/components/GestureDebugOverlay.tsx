import { DEBUG } from '../config/debug'
import type { GestureTrackingSnapshot, ProcessedHand } from '../types/gesture'

type GestureDebugOverlayProps = {
  snapshot: GestureTrackingSnapshot
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatFingerState(isExtended: boolean) {
  return isExtended ? 'extended' : 'folded'
}

function getHandTitle(hand: ProcessedHand) {
  return hand.handedness === 'Unknown' ? hand.id : `${hand.handedness} hand`
}

export function GestureDebugOverlay({ snapshot }: GestureDebugOverlayProps) {
  if (!DEBUG.enabled || !DEBUG.gestures) {
    return null
  }

  const activeHand = snapshot.hands.find(
    (hand) => hand.id === snapshot.diagnostics.activeHandId,
  )

  return (
    <aside className="gesture-debug-overlay" aria-label="Gesture debug">
      <div>
        <p>Interaction: {snapshot.interaction.current.toUpperCase()}</p>
        <p>Confidence: {formatPercent(snapshot.interaction.confidence)}</p>
        {activeHand ? <p>Active hand: {activeHand.handedness}</p> : null}
      </div>

      {snapshot.hands.map((hand) => (
        <div className="gesture-debug-hand" key={hand.id}>
          <p>{getHandTitle(hand)}</p>
          <p>
            Gesture: {hand.gesture} ({formatPercent(hand.gestureConfidence)})
          </p>
          <p>Available anchors: {hand.anchors.length}</p>
          <p>Index: {formatFingerState(hand.fingerStates.index)}</p>
          <p>Middle: {formatFingerState(hand.fingerStates.middle)}</p>
          <p>Ring: {formatFingerState(hand.fingerStates.ring)}</p>
          <p>Little: {formatFingerState(hand.fingerStates.little)}</p>
        </div>
      ))}

      {snapshot.diagnostics.palmDistanceRatio > 0 ? (
        <div>
          <p>
            Palm distance: {snapshot.diagnostics.palmDistanceRatio.toFixed(1)} hand
            widths
          </p>
          <p>Total anchors: {snapshot.diagnostics.totalAnchorCount}</p>
        </div>
      ) : null}
    </aside>
  )
}
