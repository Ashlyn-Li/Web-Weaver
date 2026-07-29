import type { ProcessedHand } from '../types/hand'
import type { WebAnchorCandidate, WebAnchorName } from '../types/interaction'
import { HAND_LANDMARKS } from '../vision/handLandmarks'
import { getLandmark } from '../vision/landmarkUtils'

const fingertipAnchors: readonly {
  name: WebAnchorName
  finger: keyof ProcessedHand['fingerStates']
  landmarkIndex: number
}[] = [
  {
    name: 'thumb-tip',
    finger: 'thumb',
    landmarkIndex: HAND_LANDMARKS.THUMB_TIP,
  },
  {
    name: 'index-tip',
    finger: 'index',
    landmarkIndex: HAND_LANDMARKS.INDEX_TIP,
  },
  {
    name: 'middle-tip',
    finger: 'middle',
    landmarkIndex: HAND_LANDMARKS.MIDDLE_TIP,
  },
  {
    name: 'ring-tip',
    finger: 'ring',
    landmarkIndex: HAND_LANDMARKS.RING_TIP,
  },
  {
    name: 'little-tip',
    finger: 'little',
    landmarkIndex: HAND_LANDMARKS.LITTLE_TIP,
  },
] as const

export function getWebAnchorCandidates(
  hand: ProcessedHand,
): WebAnchorCandidate[] {
  const candidates = fingertipAnchors.flatMap<WebAnchorCandidate>((anchor) => {
    const position = getLandmark(hand.landmarks, anchor.landmarkIndex)

    if (!position) {
      return []
    }

    return [
      {
        handId: hand.id,
        name: anchor.name,
        landmarkIndex: anchor.landmarkIndex,
        position,
        confidence: anchor.finger === 'thumb' ? 0.7 : 0.88,
      },
    ]
  })

  candidates.push({
    handId: hand.id,
    name: 'palm-centre',
    landmarkIndex: null,
    position: hand.palmCenter,
    confidence: 0.62,
  })

  return candidates
}
