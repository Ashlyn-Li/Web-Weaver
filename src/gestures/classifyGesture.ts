import { GESTURE_CONFIG } from '../config/gestures'
import type { FingerStates } from './analyseFingers'
import { calculatePinchDistance } from './landmarkUtils'
import type { HandGestureName, NormalisedPoint } from '../types/gesture'

export interface GestureClassification {
  gesture: HandGestureName
  confidence: number
}

type GestureInput = {
  fingerStates: FingerStates
  handScale: number
  landmarks: readonly NormalisedPoint[]
}

function ratioScore(matches: readonly boolean[], bonus = 0) {
  const matched = matches.filter(Boolean).length

  return Math.min(1, matched / matches.length + bonus)
}

export function classifyGesture({
  fingerStates,
  handScale,
  landmarks,
}: GestureInput): GestureClassification {
  const pinchDistance = calculatePinchDistance(landmarks, handScale)
  const classifications: GestureClassification[] = [
    {
      gesture: 'pinch',
      confidence:
        pinchDistance <= GESTURE_CONFIG.pinchDistanceRatio
          ? Math.min(1, 1 - pinchDistance / GESTURE_CONFIG.pinchDistanceRatio)
          : 0,
    },
    {
      gesture: 'web-shoot',
      confidence: ratioScore(
        [
          fingerStates.index,
          !fingerStates.middle,
          !fingerStates.ring,
          fingerStates.little,
        ],
        fingerStates.thumb ? 0.08 : 0,
      ),
    },
    {
      gesture: 'point',
      confidence: ratioScore([
        fingerStates.index,
        !fingerStates.middle,
        !fingerStates.ring,
        !fingerStates.little,
      ]),
    },
    {
      gesture: 'closed-fist',
      confidence: ratioScore([
        !fingerStates.index,
        !fingerStates.middle,
        !fingerStates.ring,
        !fingerStates.little,
      ]),
    },
    {
      gesture: 'open-palm',
      confidence: ratioScore([
        fingerStates.index,
        fingerStates.middle,
        fingerStates.ring,
        fingerStates.little,
      ]),
    },
  ]

  const bestClassification = classifications.find(
    (classification) =>
      classification.confidence >= GESTURE_CONFIG.minimumGestureConfidence,
  )

  return bestClassification ?? {
    gesture: 'unknown',
    confidence: 0,
  }
}
