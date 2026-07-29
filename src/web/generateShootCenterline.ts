import { WEB_CONFIG } from '../config/web'
import { add, scale } from '../geometry/vector3'
import type { Point3D } from '../types/hand'
import type { ShootWebControlPoint } from '../types/web'
import type { ShootCoordinateFrame } from './createShootCoordinateFrame'

type GenerateShootCenterlineOptions = {
  frame: ShootCoordinateFrame
  length: number
  origin: Point3D
  seed: number
}

function noise(seed: number, progress: number) {
  return (
    Math.sin(seed * 0.017 + progress * Math.PI * 4.7) * 0.6 +
    Math.sin(seed * 0.031 + progress * Math.PI * 9.3) * 0.4
  )
}

export function generateShootCenterline({
  frame,
  length,
  origin,
  seed,
}: GenerateShootCenterlineOptions): ShootWebControlPoint[] {
  const amplitude = Math.min(
    WEB_CONFIG.shoot.maximumCurlAmplitude,
    WEB_CONFIG.shoot.minimumCurlAmplitude + length * 0.025,
  )

  return Array.from(
    { length: WEB_CONFIG.shoot.longitudinalSegments + 1 },
    (_, index) => {
      const progress = index / WEB_CONFIG.shoot.longitudinalSegments
      const envelope = Math.sin(Math.PI * progress) ** WEB_CONFIG.shoot.taperPower
      const lateralOffset =
        envelope *
        length *
        (amplitude * Math.sin(progress * Math.PI * 2.1 + seed * 0.011) +
          WEB_CONFIG.shoot.noiseAmplitude * noise(seed, progress))
      const point = add(
        add(origin, scale(frame.direction, length * progress)),
        scale(frame.normal, lateralOffset),
      )

      return {
        ...point,
        progress,
      }
    },
  )
}
