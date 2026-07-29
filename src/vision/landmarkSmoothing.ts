import { TRACKING_CONFIG } from '../config/tracking'
import type { Handedness, NormalisedPoint } from '../types/gesture'

type SmoothingEntry = {
  landmarks: readonly NormalisedPoint[]
  missingFrames: number
}

export class LandmarkSmoother {
  private state = new Map<string, SmoothingEntry>()

  smooth(
    handId: string,
    handedness: Handedness,
    landmarks: readonly NormalisedPoint[],
  ) {
    const previous = this.state.get(handId)
    const alpha = TRACKING_CONFIG.landmarkSmoothingAlpha
    const smoothedLandmarks =
      previous && previous.landmarks.length === landmarks.length
        ? landmarks.map((landmark, index) => {
            const previousLandmark = previous.landmarks[index]

            return {
              x: alpha * landmark.x + (1 - alpha) * previousLandmark.x,
              y: alpha * landmark.y + (1 - alpha) * previousLandmark.y,
              z: alpha * landmark.z + (1 - alpha) * previousLandmark.z,
            }
          })
        : landmarks.map((landmark) => ({ ...landmark }))

    this.state.set(handId, {
      landmarks: smoothedLandmarks,
      missingFrames: 0,
    })

    if (handedness === 'Unknown') {
      this.expireMissingHands(new Set([handId]))
    }

    return smoothedLandmarks
  }

  expireMissingHands(activeIds: ReadonlySet<string>) {
    this.state.forEach((entry, handId) => {
      if (activeIds.has(handId)) {
        return
      }

      const missingFrames = entry.missingFrames + 1

      if (missingFrames >= TRACKING_CONFIG.missingHandResetFrames) {
        this.state.delete(handId)
      } else {
        this.state.set(handId, {
          ...entry,
          missingFrames,
        })
      }
    })
  }

  reset() {
    this.state.clear()
  }
}
