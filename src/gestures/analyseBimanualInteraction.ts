import { GESTURE_CONFIG } from '../config/gestures'
import { distance } from '../geometry/vector2'
import type { ProcessedHand, InteractionMode } from '../types/gesture'

export interface InteractionDiagnostics {
  activeHandId: string | null
  palmDistanceRatio: number
  totalAnchorCount: number
}

export interface InteractionClassification {
  mode: InteractionMode
  confidence: number
  diagnostics: InteractionDiagnostics
}

const emptyDiagnostics: InteractionDiagnostics = {
  activeHandId: null,
  palmDistanceRatio: 0,
  totalAnchorCount: 0,
}

function getWebShootClassification(
  hands: readonly ProcessedHand[],
): InteractionClassification {
  const shootingHand = hands.find((hand) => hand.gesture === 'web-shoot')

  if (!shootingHand) {
    return {
      mode: 'idle',
      confidence: 0,
      diagnostics: emptyDiagnostics,
    }
  }

  return {
    mode: 'web-shoot',
    confidence: shootingHand.gestureConfidence,
    diagnostics: {
      ...emptyDiagnostics,
      activeHandId: shootingHand.id,
    },
  }
}

export function analyseBimanualInteraction(
  hands: readonly ProcessedHand[],
): InteractionClassification {
  if (hands.length < 2) {
    return getWebShootClassification(hands)
  }

  const [firstHand, secondHand] = hands
  const averageHandScale = Math.max(
    (firstHand.handScale + secondHand.handScale) / 2,
    0.001,
  )
  const palmDistanceRatio =
    distance(firstHand.palmCentre, secondHand.palmCentre) / averageHandScale
  const totalAnchorCount = firstHand.anchors.length + secondHand.anchors.length
  const bothClosedFists =
    firstHand.gesture === 'closed-fist' && secondHand.gesture === 'closed-fist'
  const distanceValid =
    palmDistanceRatio >= GESTURE_CONFIG.weaveMinimumPalmDistanceRatio &&
    palmDistanceRatio <= GESTURE_CONFIG.weaveMaximumPalmDistanceRatio
  const anchorsValid = totalAnchorCount >= GESTURE_CONFIG.weaveMinimumAnchorCount
  const palmFacingConfidence =
    (firstHand.palmFacingConfidence + secondHand.palmFacingConfidence) / 2

  if (distanceValid && anchorsValid && !bothClosedFists) {
    const distanceConfidence = Math.min(
      1,
      palmDistanceRatio / GESTURE_CONFIG.weaveMinimumPalmDistanceRatio,
      GESTURE_CONFIG.weaveMaximumPalmDistanceRatio / palmDistanceRatio,
    )
    const anchorConfidence = Math.min(
      1,
      totalAnchorCount / (GESTURE_CONFIG.weaveMinimumAnchorCount + 2),
    )
    const confidence =
      distanceConfidence * 0.4 + anchorConfidence * 0.4 + palmFacingConfidence * 0.2

    if (confidence >= GESTURE_CONFIG.weaveMinimumConfidence) {
      return {
        mode: 'web-weave',
        confidence,
        diagnostics: {
          activeHandId: null,
          palmDistanceRatio,
          totalAnchorCount,
        },
      }
    }
  }

  const webShootClassification = getWebShootClassification(hands)

  return {
    ...webShootClassification,
    diagnostics: {
      ...webShootClassification.diagnostics,
      palmDistanceRatio,
      totalAnchorCount,
    },
  }
}
