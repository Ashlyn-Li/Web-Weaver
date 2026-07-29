import { normalise } from '../geometry/vector3'
import type { Point3D } from '../types/hand'

export type ShootCoordinateFrame = {
  direction: Point3D
  normal: Point3D
}

export function createShootCoordinateFrame(direction: Point3D): ShootCoordinateFrame {
  const normalisedDirection = normalise({
    x: direction.x,
    y: direction.y,
    z: 0,
  })
  const directionOrFallback =
    normalisedDirection.x === 0 && normalisedDirection.y === 0
      ? { x: 0, y: -1, z: 0 }
      : normalisedDirection

  return {
    direction: directionOrFallback,
    normal: {
      x: -directionOrFallback.y,
      y: directionOrFallback.x,
      z: 0,
    },
  }
}
