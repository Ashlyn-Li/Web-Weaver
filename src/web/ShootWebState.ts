import { WEB_CONFIG } from '../config/web'
import { add, dot, normalise, scale } from '../geometry/vector3'
import type { Point3D, ProcessedHand } from '../types/hand'
import type { WebAnchor } from '../types/web'
import { hashSeed } from '../utils/seededRandom'
import { calculateWebShootDirection } from './calculateWebShootDirection'

type ShootProjectile = {
  activeHandId: string
  direction: Point3D
  head: Point3D
  length: number
  seed: number
  width: number
}

function isOutOfScene(point: Point3D) {
  return point.x < -0.35 || point.x > 1.35 || point.y < -0.35 || point.y > 1.35
}

export class ShootWebState {
  private projectile: ShootProjectile | null = null
  private sequence = 0

  update(hand: ProcessedHand, origin: WebAnchor): ShootProjectile | null {
    if (!this.projectile || this.projectile.activeHandId !== hand.id) {
      this.sequence += 1
      this.projectile = {
        activeHandId: hand.id,
        direction: calculateWebShootDirection(hand),
        head: origin,
        length: hand.handScale * WEB_CONFIG.shoot.projectileLengthRatio,
        seed: hashSeed(`${hand.id}:web-shot:${this.sequence}`),
        width: hand.handScale * WEB_CONFIG.shoot.projectileWidthRatio,
      }
    }

    const nextDirection = calculateWebShootDirection(hand)
    const directionAlignment = dot(this.projectile.direction, nextDirection)
    const direction =
      directionAlignment < -0.35
        ? this.projectile.direction
        : normalise(
            add(
              scale(this.projectile.direction, 0.82),
              scale(nextDirection, 0.18),
            ),
          )

    this.projectile = {
      ...this.projectile,
      direction,
      head: add(
        this.projectile.head,
        scale(direction, hand.handScale * WEB_CONFIG.shoot.projectileSpeedRatio),
      ),
      length:
        this.projectile.length * 0.9 +
        hand.handScale * WEB_CONFIG.shoot.projectileLengthRatio * 0.1,
      width:
        this.projectile.width * 0.9 +
        hand.handScale * WEB_CONFIG.shoot.projectileWidthRatio * 0.1,
    }

    if (isOutOfScene(this.projectile.head)) {
      return null
    }

    return this.projectile
  }

  reset() {
    this.projectile = null
  }
}
