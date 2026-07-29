import { WEB_CONFIG } from '../config/web'
import { add, scale } from '../geometry/vector3'
import type { ShootWebControlPoint, ShootWebPath } from '../types/web'
import { createSeededRandom } from '../utils/seededRandom'
import { calculateShootWidthEnvelope } from './calculateShootWidthEnvelope'
import type { ShootCoordinateFrame } from './createShootCoordinateFrame'

type GenerateShootLongitudinalStrandsOptions = {
  centerline: readonly ShootWebControlPoint[]
  frame: ShootCoordinateFrame
  length: number
  seed: number
}

function strandOffset(
  progress: number,
  length: number,
  phase: number,
  cycles: number,
  amplitude: number,
  laneOffset: number,
) {
  const envelope = Math.sin(Math.PI * progress) ** WEB_CONFIG.shoot.taperPower
  const width = calculateShootWidthEnvelope(progress, length)

  return (
    laneOffset * width +
    envelope * length * amplitude * Math.sin(progress * Math.PI * 2 * cycles + phase)
  )
}

export function generateShootLongitudinalStrands({
  centerline,
  frame,
  length,
  seed,
}: GenerateShootLongitudinalStrandsOptions): ShootWebPath[] {
  const random = createSeededRandom(seed)
  const totalStrands =
    WEB_CONFIG.shoot.coreStrandCount + WEB_CONFIG.shoot.outerStrandCount
  const middle = (totalStrands - 1) / 2

  return Array.from({ length: totalStrands }, (_, index) => {
    const isCore = index < WEB_CONFIG.shoot.coreStrandCount
    const laneOffset = isCore
      ? (index - (WEB_CONFIG.shoot.coreStrandCount - 1) / 2) * 0.22
      : (index - middle) / Math.max(1, middle)
    const phase = random() * Math.PI * 2
    const cycles =
      WEB_CONFIG.shoot.minimumCurlCycles +
      random() *
        (WEB_CONFIG.shoot.maximumCurlCycles - WEB_CONFIG.shoot.minimumCurlCycles)
    const amplitude =
      (isCore
        ? WEB_CONFIG.shoot.minimumCurlAmplitude
        : WEB_CONFIG.shoot.maximumCurlAmplitude) *
      (0.65 + random() * 0.45)
    const points = centerline.map((point) => {
      const offset = strandOffset(
        point.progress,
        length,
        phase,
        cycles,
        amplitude,
        laneOffset,
      )

      return {
        ...add(point, scale(frame.normal, offset)),
        progress: point.progress,
      }
    })

    return {
      id: `shoot:${isCore ? 'core' : 'outer'}:${index}`,
      opacity: isCore ? 0.92 : 0.58,
      points,
      role: isCore ? 'core' : 'outer',
      thickness: isCore ? WEB_CONFIG.shoot.strandThickness : 1.25,
    }
  })
}
