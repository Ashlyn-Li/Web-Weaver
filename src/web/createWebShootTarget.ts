import { WEB_CONFIG } from '../config/web'
import { add, scale } from '../geometry/vector3'
import type { Point3D } from '../types/hand'
import type { WebAnchor } from '../types/web'

function clamp(value: number) {
  return Math.min(1.1, Math.max(-0.1, value))
}

export class WebShootTargetTracker {
  private previousTargets = new Map<string, Point3D>()

  createTarget(
    origin: WebAnchor,
    direction: Point3D,
    handScale: number,
    id = 'virtual-screen-target',
  ): WebAnchor {
    const projected = add(
      origin,
      scale(direction, handScale * WEB_CONFIG.shoot.targetDistanceRatio),
    )
    const target = {
      x: clamp(projected.x),
      y: clamp(projected.y),
      z: projected.z,
    }

    const previousTarget = this.previousTargets.get(id)

    if (previousTarget) {
      const alpha = WEB_CONFIG.shoot.targetSmoothingAlpha
      target.x = alpha * target.x + (1 - alpha) * previousTarget.x
      target.y = alpha * target.y + (1 - alpha) * previousTarget.y
      target.z = alpha * target.z + (1 - alpha) * previousTarget.z
    }

    this.previousTargets.set(id, target)

    return {
      id,
      ...target,
      source: 'screen-target',
    }
  }

  reset() {
    this.previousTargets.clear()
  }
}
