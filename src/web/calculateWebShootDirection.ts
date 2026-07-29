import { normalise, subtract } from '../geometry/vector3'
import type { Point3D, ProcessedHand } from '../types/hand'
import { HAND_LANDMARKS } from '../vision/handLandmarks'
import { getLandmark } from '../vision/landmarkUtils'

export function calculateWebShootDirection(hand: ProcessedHand): Point3D {
  const wrist = getLandmark(hand.landmarks, HAND_LANDMARKS.WRIST)
  const indexMcp = getLandmark(hand.landmarks, HAND_LANDMARKS.INDEX_MCP)
  const indexTip = getLandmark(hand.landmarks, HAND_LANDMARKS.INDEX_TIP)
  const littleTip = getLandmark(hand.landmarks, HAND_LANDMARKS.LITTLE_TIP)

  if (indexMcp && indexTip) {
    return normalise(subtract(indexTip, indexMcp))
  }

  if (wrist && littleTip) {
    return normalise(subtract(littleTip, wrist))
  }

  return normalise(hand.palmNormal)
}
