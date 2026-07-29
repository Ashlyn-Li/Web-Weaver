import { WEB_CONFIG } from '../config/web'
import { add, scale } from '../geometry/vector3'
import type { Point3D } from '../types/hand'
import type { WebAnchor } from '../types/web'

function clamp(value: number) {
  return Math.min(1.1, Math.max(-0.1, value))
}

export class WebShootTargetTracker {
  private previousTarget: Point3D | null = null

  createTarget(origin: WebAnchor, direction: Point3D, handScale: number): WebAnchor {
    const projected = add(
      origin,
      scale(direction, handScale * WEB_CONFIG.shoot.targetDistanceRatio),
    )
    const target = {
      x: clamp(projected.x),
      y: clamp(projected.y),
      z: projected.z,
    }

    if (this.previousTarget) {
      const alpha = WEB_CONFIG.shoot.targetSmoothingAlpha
      target.x = alpha * target.x + (1 - alpha) * this.previousTarget.x
      target.y = alpha * target.y + (1 - alpha) * this.previousTarget.y
      target.z = alpha * target.z + (1 - alpha) * this.previousTarget.z
    }

    this.previousTarget = target

    return {
      id: 'virtual-screen-target',
      ...target,
      source: 'screen-target',
    }
  }

  reset() {
    this.previousTarget = null
  }
}
