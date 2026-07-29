import { cross, normalise, subtract } from '../geometry/vector3'
import type { Point3D } from '../types/hand'
import { HAND_LANDMARKS } from './handLandmarks'
import { getLandmark } from './landmarkUtils'

export function calculatePalmOrientation(
  landmarks: readonly Point3D[],
): Point3D {
  const wrist = getLandmark(landmarks, HAND_LANDMARKS.WRIST)
  const indexMcp = getLandmark(landmarks, HAND_LANDMARKS.INDEX_MCP)
  const littleMcp = getLandmark(landmarks, HAND_LANDMARKS.LITTLE_MCP)

  if (!wrist || !indexMcp || !littleMcp) {
    return { x: 0, y: 0, z: 0 }
  }

  return normalise(cross(subtract(indexMcp, wrist), subtract(littleMcp, wrist)))
}
