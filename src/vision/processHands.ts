import type { Category, HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { Handedness, Point3D, ProcessedHand } from '../types/hand'
import { analyseFingerStates } from './analyseFingerStates'
import { calculateHandScale } from './calculateHandScale'
import { calculatePalmCenter } from './calculatePalmCenter'
import { calculatePalmOrientation } from './calculatePalmOrientation'
import { LandmarkSmoother } from './landmarkSmoother'

function getHandedness(classifications: readonly Category[] | undefined): Handedness {
  const categoryName = classifications?.[0]?.categoryName

  if (categoryName === 'Left' || categoryName === 'Right') {
    return categoryName
  }

  return 'Unknown'
}

function getHandId(handedness: Handedness, index: number) {
  return handedness === 'Unknown' ? `Unknown-${index}` : handedness
}

function toPoint3D(landmarks: HandLandmarkerResult['landmarks'][number]) {
  return landmarks.map<Point3D>((landmark) => ({
    x: landmark.x,
    y: landmark.y,
    z: landmark.z ?? 0,
  }))
}

export class HandProcessor {
  private smoother = new LandmarkSmoother()

  process(result: HandLandmarkerResult): ProcessedHand[] {
    const handedness = result.handedness ?? result.handednesses ?? []
    const activeIds = new Set<string>()
    const hands = result.landmarks.flatMap<ProcessedHand>((landmarks, index) => {
      if (landmarks.length < 21) {
        return []
      }

      const hand = getHandedness(handedness[index])
      const id = getHandId(hand, index)
      activeIds.add(id)

      const smoothedLandmarks = this.smoother.smooth(id, hand, toPoint3D(landmarks))
      const handScale = calculateHandScale(smoothedLandmarks)

      return [
        {
          id,
          handedness: hand,
          landmarks: smoothedLandmarks,
          palmCenter: calculatePalmCenter(smoothedLandmarks),
          palmNormal: calculatePalmOrientation(smoothedLandmarks),
          handScale,
          fingerStates: analyseFingerStates(smoothedLandmarks, handScale),
        },
      ]
    })

    this.smoother.expireMissingHands(activeIds)

    return hands
  }

  reset() {
    this.smoother.reset()
  }
}
