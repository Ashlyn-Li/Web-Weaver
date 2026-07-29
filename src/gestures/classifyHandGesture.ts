import { GESTURE_CONFIG } from '../config/gestures'
import { distance } from '../geometry/vector3'
import type { ProcessedHand } from '../types/hand'
import type {
  HandGestureClassification,
  HandGestureName,
} from '../types/interaction'
import { HAND_LANDMARKS } from '../vision/handLandmarks'
import { getLandmark } from '../vision/landmarkUtils'

type ScoredGesture = HandGestureClassification

function scorePattern(matches: readonly boolean[], bonus = 0) {
  return Math.min(1, matches.filter(Boolean).length / matches.length + bonus)
}

function getPinchConfidence(hand: ProcessedHand) {
  const thumbTip = getLandmark(hand.landmarks, HAND_LANDMARKS.THUMB_TIP)
  const indexTip = getLandmark(hand.landmarks, HAND_LANDMARKS.INDEX_TIP)

  if (!thumbTip || !indexTip || hand.handScale <= 0.001) {
    return 0
  }

  const ratio = distance(thumbTip, indexTip) / hand.handScale

  if (ratio >= GESTURE_CONFIG.pinchDistanceRatio) {
    return 0
  }

  return Math.min(1, 1 - ratio / GESTURE_CONFIG.pinchDistanceRatio)
}

function getGestureCandidates(hand: ProcessedHand): readonly ScoredGesture[] {
  const { fingerStates } = hand
  const palmVisibilityBonus = Math.min(0.08, Math.abs(hand.palmNormal.z) * 0.08)

  return [
    {
      gesture: 'pinch',
      confidence: getPinchConfidence(hand),
    },
    {
      gesture: 'web-shoot',
      confidence: scorePattern(
        [
          fingerStates.index.extended,
          !fingerStates.middle.extended,
          !fingerStates.ring.extended,
          fingerStates.little.extended,
        ],
        fingerStates.thumb.extended ? 0.06 : palmVisibilityBonus,
      ),
    },
    {
      gesture: 'point',
      confidence: scorePattern([
        fingerStates.index.extended,
        !fingerStates.middle.extended,
        !fingerStates.ring.extended,
        !fingerStates.little.extended,
      ]),
    },
    {
      gesture: 'closed-fist',
      confidence: scorePattern([
        !fingerStates.index.extended,
        !fingerStates.middle.extended,
        !fingerStates.ring.extended,
        !fingerStates.little.extended,
      ]),
    },
    {
      gesture: 'open-palm',
      confidence: scorePattern([
        fingerStates.index.extended,
        fingerStates.middle.extended,
        fingerStates.ring.extended,
        fingerStates.little.extended,
      ]),
    },
  ] as const
}

export const HAND_GESTURE_PRIORITY: readonly HandGestureName[] = [
  'pinch',
  'web-shoot',
  'point',
  'closed-fist',
  'open-palm',
  'unknown',
]

export function classifyHandGesture(hand: ProcessedHand): HandGestureClassification {
  const candidates = getGestureCandidates(hand)
  const selectedCandidate = HAND_GESTURE_PRIORITY.flatMap((gesture) =>
    candidates.filter((candidate) => candidate.gesture === gesture),
  ).find(
    (candidate) =>
      candidate.confidence >= GESTURE_CONFIG.minimumGestureConfidence,
  )

  return selectedCandidate ?? {
    gesture: 'unknown',
    confidence: 0,
  }
}
