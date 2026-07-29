import { WEB_CONFIG } from '../config/web'
import type { ShootWebPath } from '../types/web'
import { createSeededRandom } from '../utils/seededRandom'

export function generateShootCrossLinks(
  paths: readonly ShootWebPath[],
  seed: number,
): ShootWebPath[] {
  const random = createSeededRandom(seed ^ 0x9e3779b9)
  const crossLinks: ShootWebPath[] = []

  for (
    let segment = WEB_CONFIG.shoot.crossLinkInterval;
    segment < WEB_CONFIG.shoot.longitudinalSegments;
    segment += WEB_CONFIG.shoot.crossLinkInterval
  ) {
    const progress = segment / WEB_CONFIG.shoot.longitudinalSegments
    const probability =
      WEB_CONFIG.shoot.crossLinkProbability *
      (0.65 + progress * 0.45)

    for (let pathIndex = 0; pathIndex < paths.length - 1; pathIndex += 1) {
      if (random() > probability) {
        continue
      }

      const firstPoint = paths[pathIndex].points[segment]
      const secondPoint = paths[pathIndex + 1].points[
        Math.min(paths[pathIndex + 1].points.length - 1, segment + (random() > 0.5 ? 1 : -1))
      ]

      if (!firstPoint || !secondPoint) {
        continue
      }

      crossLinks.push({
        id: `shoot:cross:${pathIndex}:${pathIndex + 1}:${segment}`,
        opacity: 0.42,
        points: [
          firstPoint,
          {
            x: (firstPoint.x + secondPoint.x) / 2,
            y: (firstPoint.y + secondPoint.y) / 2,
            z: (firstPoint.z + secondPoint.z) / 2,
            progress,
          },
          secondPoint,
        ],
        role: 'cross-link',
        thickness: 0.9,
      })
    }
  }

  return crossLinks
}
