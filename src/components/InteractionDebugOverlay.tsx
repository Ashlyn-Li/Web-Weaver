import { DEBUG } from '../config/debug'
import type { ProcessedHand } from '../types/hand'
import type { InteractionSnapshot } from '../types/interaction'

type InteractionDebugOverlayProps = {
  hands: readonly ProcessedHand[]
  snapshot: InteractionSnapshot
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function InteractionDebugOverlay({
  hands,
  snapshot,
}: InteractionDebugOverlayProps) {
  if (!DEBUG.enabled || !DEBUG.gestures) {
    return null
  }

  const activeHand = hands.find(
    (hand) => hand.id === snapshot.stableInteraction.activeHandId,
  )

  return (
    <aside className="interaction-debug-overlay" aria-label="Interaction debug">
      <div>
        <p>Interaction: {snapshot.stableInteraction.current.toUpperCase()}</p>
        <p>Confidence: {formatPercent(snapshot.stableInteraction.confidence)}</p>
        {activeHand ? <p>Active hand: {activeHand.handedness}</p> : null}
      </div>

      {hands.map((hand) => {
        const gesture = snapshot.stableHandGestures.find(
          (stableGesture) => stableGesture.handId === hand.id,
        )
        const anchorCount = snapshot.webAnchorCandidates.filter(
          (anchor) => anchor.handId === hand.id,
        ).length

        return (
          <div className="interaction-debug-hand" key={hand.id}>
            <p>{hand.handedness} hand</p>
            <p>Gesture: {gesture?.gesture ?? 'unknown'}</p>
            <p>Confidence: {formatPercent(gesture?.confidence ?? 0)}</p>
            <p>Anchors: {anchorCount}</p>
          </div>
        )
      })}

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
