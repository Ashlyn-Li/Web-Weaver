import type { Point3D } from '../types/hand'
import { calculatePalmHeight, calculatePalmWidth } from './landmarkUtils'

export function calculateHandScale(landmarks: readonly Point3D[]) {
  const palmWidth = calculatePalmWidth(landmarks)
  const palmHeight = calculatePalmHeight(landmarks)

  return Math.max((palmWidth + palmHeight) / 2, palmWidth, palmHeight, 0.001)
}
