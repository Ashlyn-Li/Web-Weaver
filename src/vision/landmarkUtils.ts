import { angleBetween, distance, subtract } from '../geometry/vector3'
import type { Point3D } from '../types/hand'
import { FINGER_LANDMARKS, HAND_LANDMARKS } from './handLandmarks'

export function getLandmark(landmarks: readonly Point3D[], index: number) {
  return landmarks[index] ?? null
}

export function getFinger(
  landmarks: readonly Point3D[],
  finger: keyof typeof FINGER_LANDMARKS,
) {
  return FINGER_LANDMARKS[finger].map((index) => getLandmark(landmarks, index))
}

export function getPalmPoints(landmarks: readonly Point3D[]) {
  return [
    getLandmark(landmarks, HAND_LANDMARKS.WRIST),
    getLandmark(landmarks, HAND_LANDMARKS.INDEX_MCP),
    getLandmark(landmarks, HAND_LANDMARKS.MIDDLE_MCP),
    getLandmark(landmarks, HAND_LANDMARKS.RING_MCP),
    getLandmark(landmarks, HAND_LANDMARKS.LITTLE_MCP),
  ].filter((point): point is Point3D => point !== null)
}

export function calculateDistance(
  landmarks: readonly Point3D[],
  firstIndex: number,
  secondIndex: number,
) {
  const first = getLandmark(landmarks, firstIndex)
  const second = getLandmark(landmarks, secondIndex)

  return first && second ? distance(first, second) : 0
}

export function calculateJointAngle(
  landmarks: readonly Point3D[],
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

export function calculatePalmWidth(landmarks: readonly Point3D[]) {
  return calculateDistance(
    landmarks,
    HAND_LANDMARKS.INDEX_MCP,
    HAND_LANDMARKS.LITTLE_MCP,
  )
}

export function calculatePalmHeight(landmarks: readonly Point3D[]) {
  return calculateDistance(
    landmarks,
    HAND_LANDMARKS.WRIST,
    HAND_LANDMARKS.MIDDLE_MCP,
  )
}
