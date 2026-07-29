import { distance } from '../geometry/vector3'
import type { FingerState, FingerStates, Point3D } from '../types/hand'
import { calculatePalmCenter } from './calculatePalmCenter'
import { FINGER_LANDMARKS, HAND_LANDMARKS } from './handLandmarks'
import { calculateJointAngle, getLandmark } from './landmarkUtils'

const extendedAngleThreshold = 150
const minimumTipDistanceRatio = 0.72
const minimumThumbDistanceRatio = 0.58

function createFingerState(extended: boolean): FingerState {
  return { extended }
}

function getTipDistanceRatio(
  landmarks: readonly Point3D[],
  tipIndex: number,
  handScale: number,
) {
  const tip = getLandmark(landmarks, tipIndex)
  const palmCenter = calculatePalmCenter(landmarks)

  if (!tip || handScale <= 0.001) {
    return 0
  }

  return distance(tip, palmCenter) / handScale
}

function isFingerExtended(
  landmarks: readonly Point3D[],
  handScale: number,
  finger: keyof Omit<FingerStates, 'thumb'>,
) {
  const [mcp, pip, dip, tip] = FINGER_LANDMARKS[finger]
  const pipAngle = calculateJointAngle(landmarks, mcp, pip, dip)
  const dipAngle = calculateJointAngle(landmarks, pip, dip, tip)
  const tipDistanceRatio = getTipDistanceRatio(landmarks, tip, handScale)

  return (
    pipAngle >= extendedAngleThreshold &&
    dipAngle >= 120 &&
    tipDistanceRatio >= minimumTipDistanceRatio
  )
}

function isThumbExtended(landmarks: readonly Point3D[], handScale: number) {
  const thumbTip = getLandmark(landmarks, HAND_LANDMARKS.THUMB_TIP)
  const indexMcp = getLandmark(landmarks, HAND_LANDMARKS.INDEX_MCP)

  if (!thumbTip || !indexMcp || handScale <= 0.001) {
    return false
  }

  return distance(thumbTip, indexMcp) / handScale >= minimumThumbDistanceRatio
}

export function analyseFingerStates(
  landmarks: readonly Point3D[],
  handScale: number,
): FingerStates {
  return {
    thumb: createFingerState(isThumbExtended(landmarks, handScale)),
    index: createFingerState(isFingerExtended(landmarks, handScale, 'index')),
    middle: createFingerState(isFingerExtended(landmarks, handScale, 'middle')),
    ring: createFingerState(isFingerExtended(landmarks, handScale, 'ring')),
    little: createFingerState(isFingerExtended(landmarks, handScale, 'little')),
  }
}
