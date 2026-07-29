import type { Point3D } from '../types/hand'
import { getPalmPoints } from './landmarkUtils'

export function calculatePalmCenter(landmarks: readonly Point3D[]): Point3D {
  const points = getPalmPoints(landmarks)

  if (points.length === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: points.reduce((sum, point) => sum + point.z, 0) / points.length,
  }
}
