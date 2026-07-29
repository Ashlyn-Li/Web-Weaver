import { GESTURE_CONFIG } from '../config/gestures'
import { distance } from '../geometry/vector3'
import type { ProcessedHand } from '../types/hand'
import type {
  InteractionClassification,
  InteractionDiagnostics,
  StableHandGesture,
  WebAnchorCandidate,
} from '../types/interaction'

type AnalyseBimanualInteractionOptions = {
  anchors: readonly WebAnchorCandidate[]
  hands: readonly ProcessedHand[]
  stableHandGestures: readonly StableHandGesture[]
}

export function createEmptyInteractionDiagnostics(): InteractionDiagnostics {
  return {
    palmDistanceRatio: 0,
    totalAnchorCount: 0,
  }
}

export function analyseBimanualInteraction({
  anchors,
  hands,
  stableHandGestures,
}: AnalyseBimanualInteractionOptions): InteractionClassification & {
  diagnostics: InteractionDiagnostics
} {
  if (hands.length < 2) {
    return {
      mode: 'idle',
      confidence: 0,
      diagnostics: createEmptyInteractionDiagnostics(),
    }
  }

  const [firstHand, secondHand] = hands
  const averageHandScale = Math.max(
    (firstHand.handScale + secondHand.handScale) / 2,
    0.001,
  )
  const palmDistanceRatio =
    distance(firstHand.palmCenter, secondHand.palmCenter) / averageHandScale
  const totalAnchorCount = anchors.length
  const firstGesture = stableHandGestures.find(
    (gesture) => gesture.handId === firstHand.id,
  )
  const secondGesture = stableHandGestures.find(
    (gesture) => gesture.handId === secondHand.id,
  )
  const bothClosedFists =
    firstGesture?.gesture === 'closed-fist' &&
    secondGesture?.gesture === 'closed-fist'
  const distanceValid =
    palmDistanceRatio >= GESTURE_CONFIG.weaveMinimumPalmDistanceRatio &&
    palmDistanceRatio <= GESTURE_CONFIG.weaveMaximumPalmDistanceRatio
  const anchorsValid = totalAnchorCount >= GESTURE_CONFIG.weaveMinimumAnchorCount

  if (!distanceValid || !anchorsValid || bothClosedFists) {
    return {
      mode: 'idle',
      confidence: 0,
      diagnostics: {
        palmDistanceRatio,
        totalAnchorCount,
      },
    }
  }

  const distanceConfidence = Math.min(
    1,
    palmDistanceRatio / GESTURE_CONFIG.weaveMinimumPalmDistanceRatio,
    GESTURE_CONFIG.weaveMaximumPalmDistanceRatio / palmDistanceRatio,
  )
  const anchorConfidence = Math.min(
    1,
    totalAnchorCount / (GESTURE_CONFIG.weaveMinimumAnchorCount + 2),
  )
  const orientationConfidence =
    (Math.abs(firstHand.palmNormal.z) + Math.abs(secondHand.palmNormal.z)) / 2
  const confidence =
    distanceConfidence * 0.42 +
    anchorConfidence * 0.4 +
    orientationConfidence * 0.18

  return {
    mode:
      confidence >= GESTURE_CONFIG.weaveMinimumConfidence ? 'web-weave' : 'idle',
    confidence,
    diagnostics: {
      palmDistanceRatio,
      totalAnchorCount,
    },
  }
}
