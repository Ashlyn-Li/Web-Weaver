import { angleBetween, distance, subtract } from '../geometry/vector2'
import type { NormalisedPoint } from '../types/gesture'

export const LANDMARK_INDEX = {
  wrist: 0,
  thumbMcp: 2,
  thumbTip: 4,
  indexMcp: 5,
  indexPip: 6,
  indexDip: 7,
  indexTip: 8,
  middleMcp: 9,
  middlePip: 10,
  middleDip: 11,
  middleTip: 12,
  ringMcp: 13,
  ringPip: 14,
  ringDip: 15,
  ringTip: 16,
  littleMcp: 17,
  littlePip: 18,
  littleDip: 19,
  littleTip: 20,
} as const

export function getLandmark(
  landmarks: readonly NormalisedPoint[],
  index: number,
) {
  return landmarks[index] ?? null
}

export function landmarkDistance(
  landmarks: readonly NormalisedPoint[],
  firstIndex: number,
  secondIndex: number,
) {
  const first = getLandmark(landmarks, firstIndex)
  const second = getLandmark(landmarks, secondIndex)

  if (!first || !second) {
    return 0
  }

  const planarDistance = distance(first, second)
  const zDistance = first.z - second.z

  return Math.hypot(planarDistance, zDistance)
}

export function calculateJointAngle(
  landmarks: readonly NormalisedPoint[],
  firstIndex: number,
  jointIndex: number,
  thirdIndex: number,
) {
  const first = getLandmark(landmarks, firstIndex)
  const joint = getLandmark(landmarks, jointIndex)
  const third = getLandmark(landmarks, thirdIndex)

  if (!first || !joint || !third) {
    return 0
  }

  return angleBetween(subtract(first, joint), subtract(third, joint))
}

export function calculatePalmCentre(
  landmarks: readonly NormalisedPoint[],
): NormalisedPoint {
  const indices = [
    LANDMARK_INDEX.wrist,
    LANDMARK_INDEX.indexMcp,
    LANDMARK_INDEX.middleMcp,
    LANDMARK_INDEX.ringMcp,
    LANDMARK_INDEX.littleMcp,
  ]
  const points = indices
    .map((index) => getLandmark(landmarks, index))
    .filter((point): point is NormalisedPoint => point !== null)

  if (points.length === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: points.reduce((sum, point) => sum + point.z, 0) / points.length,
  }
}

export function calculatePalmSize(landmarks: readonly NormalisedPoint[]) {
  const wristToMiddle = landmarkDistance(
    landmarks,
    LANDMARK_INDEX.wrist,
    LANDMARK_INDEX.middleMcp,
  )
  const palmWidth = landmarkDistance(
    landmarks,
    LANDMARK_INDEX.indexMcp,
    LANDMARK_INDEX.littleMcp,
  )
  const scale = Math.max((wristToMiddle + palmWidth) / 2, palmWidth, 0.001)

  return scale
}

export function normaliseMeasurement(value: number, handScale: number) {
  if (handScale <= 0.001) {
    return 0
  }

  return value / handScale
}

export function calculatePinchDistance(
  landmarks: readonly NormalisedPoint[],
  handScale: number,
) {
  return normaliseMeasurement(
    landmarkDistance(
      landmarks,
      LANDMARK_INDEX.thumbTip,
      LANDMARK_INDEX.indexTip,
    ),
    handScale,
  )
}

export function calculatePalmFacingConfidence(
  landmarks: readonly NormalisedPoint[],
) {
  const wrist = getLandmark(landmarks, LANDMARK_INDEX.wrist)
  const indexMcp = getLandmark(landmarks, LANDMARK_INDEX.indexMcp)
  const littleMcp = getLandmark(landmarks, LANDMARK_INDEX.littleMcp)

  if (!wrist || !indexMcp || !littleMcp) {
    return 0
  }

  const depthSpread = Math.max(
    Math.abs(wrist.z - indexMcp.z),
    Math.abs(wrist.z - littleMcp.z),
    Math.abs(indexMcp.z - littleMcp.z),
  )

  return Math.max(0, Math.min(1, 1 - depthSpread * 10))
}
