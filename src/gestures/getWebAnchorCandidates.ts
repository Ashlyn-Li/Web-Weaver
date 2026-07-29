import type { FingerStates } from './analyseFingers'
import {
  LANDMARK_INDEX,
  calculatePalmCentre,
  getLandmark,
} from './landmarkUtils'
import type { NormalisedPoint } from '../types/gesture'

export type WebAnchorName =
  | 'thumb-tip'
  | 'index-tip'
  | 'middle-tip'
  | 'ring-tip'
  | 'little-tip'
  | 'palm-centre'

export interface WebAnchorCandidate {
  handId: string
  name: WebAnchorName
  landmarkIndex: number | null
  position: NormalisedPoint
  confidence: number
}

type GetWebAnchorCandidatesOptions = {
  fingerStates: FingerStates
  handId: string
  landmarks: readonly NormalisedPoint[]
}

const fingertipAnchors = [
  {
    finger: 'thumb',
    landmarkIndex: LANDMARK_INDEX.thumbTip,
    name: 'thumb-tip',
  },
  {
    finger: 'index',
    landmarkIndex: LANDMARK_INDEX.indexTip,
    name: 'index-tip',
  },
  {
    finger: 'middle',
    landmarkIndex: LANDMARK_INDEX.middleTip,
    name: 'middle-tip',
  },
  {
    finger: 'ring',
    landmarkIndex: LANDMARK_INDEX.ringTip,
    name: 'ring-tip',
  },
  {
    finger: 'little',
    landmarkIndex: LANDMARK_INDEX.littleTip,
    name: 'little-tip',
  },
] as const

export function getWebAnchorCandidates({
  fingerStates,
  handId,
  landmarks,
}: GetWebAnchorCandidatesOptions): WebAnchorCandidate[] {
  const candidates: WebAnchorCandidate[] = fingertipAnchors.flatMap((anchor) => {
    const point = getLandmark(landmarks, anchor.landmarkIndex)

    if (!point || !fingerStates[anchor.finger]) {
      return []
    }

    return [
      {
        handId,
        name: anchor.name,
        landmarkIndex: anchor.landmarkIndex,
        position: point,
        confidence: anchor.finger === 'thumb' ? 0.72 : 0.88,
      },
    ]
  })

  candidates.push({
    handId,
    name: 'palm-centre',
    landmarkIndex: null,
    position: calculatePalmCentre(landmarks),
    confidence: 0.62,
  })

  return candidates
}
