import { WEB_CONFIG } from '../config/web'
import { add, scale } from '../geometry/vector3'
import type { ShootWebControlPoint, ShootWebPath } from '../types/web'
import { createSeededRandom } from '../utils/seededRandom'
import { calculateShootWidthEnvelope } from './calculateShootWidthEnvelope'
import type { ShootCoordinateFrame } from './createShootCoordinateFrame'

type GenerateShootWebHeadOptions = {
  frame: ShootCoordinateFrame
  length: number
  seed: number
  target: ShootWebControlPoint
}

export function generateShootWebHead({
  frame,
  length,
  seed,
  target,
}: GenerateShootWebHeadOptions): ShootWebPath[] {
  if (length < WEB_CONFIG.shoot.minimumLength * 1.4) {
    return []
  }

  const random = createSeededRandom(seed ^ 0x85ebca6b)
  const width = calculateShootWidthEnvelope(1, length)
  const startProgress = 1 - WEB_CONFIG.shoot.headLengthRatio
  const headBase = add(target, scale(frame.direction, -length * WEB_CONFIG.shoot.headLengthRatio))
  const radialPaths = Array.from(
    { length: WEB_CONFIG.shoot.headRadialStrandCount },
    (_, index): ShootWebPath => {
      const offset =
        ((index / Math.max(1, WEB_CONFIG.shoot.headRadialStrandCount - 1)) - 0.5) *
        2 *
        width *
        (0.72 + random() * 0.35)
      const end = add(target, scale(frame.normal, offset))
      const control = add(
        add(headBase, scale(frame.direction, length * WEB_CONFIG.shoot.headLengthRatio * 0.45)),
        scale(frame.normal, offset * 0.45),
      )

      return {
        id: `shoot:head:radial:${index}`,
        opacity: 0.56,
        points: [
          { ...headBase, progress: startProgress },
          { ...control, progress: (startProgress + 1) / 2 },
          { ...end, progress: 1 },
        ],
        role: 'head',
        thickness: 1,
      }
    },
  )
  const crossLinks = radialPaths.slice(0, -1).map((path, index): ShootWebPath => {
    const nextPath = radialPaths[index + 1]
    const firstPoint = path.points[path.points.length - 1]
    const secondPoint = nextPath.points[nextPath.points.length - 1]

    return {
      id: `shoot:head:cross:${index}`,
      opacity: 0.4,
      points: [firstPoint, secondPoint],
      role: 'head',
      thickness: 0.85,
    }
  })

  return [...radialPaths, ...crossLinks]
}
