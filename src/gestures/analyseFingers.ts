import { GESTURE_CONFIG } from '../config/gestures'
import {
  LANDMARK_INDEX,
  calculateJointAngle,
  calculatePalmCentre,
  landmarkDistance,
  normaliseMeasurement,
} from './landmarkUtils'
import type { NormalisedPoint } from '../types/gesture'

export interface FingerStates {
  thumb: boolean
  index: boolean
  middle: boolean
  ring: boolean
  little: boolean
}

type FingerDefinition = {
  base: number
  pip: number
  dip: number
  tip: number
}

const fingerDefinitions = {
  index: {
    base: LANDMARK_INDEX.indexMcp,
    pip: LANDMARK_INDEX.indexPip,
    dip: LANDMARK_INDEX.indexDip,
    tip: LANDMARK_INDEX.indexTip,
  },
  middle: {
    base: LANDMARK_INDEX.middleMcp,
    pip: LANDMARK_INDEX.middlePip,
    dip: LANDMARK_INDEX.middleDip,
    tip: LANDMARK_INDEX.middleTip,
  },
  ring: {
    base: LANDMARK_INDEX.ringMcp,
    pip: LANDMARK_INDEX.ringPip,
    dip: LANDMARK_INDEX.ringDip,
    tip: LANDMARK_INDEX.ringTip,
  },
  little: {
    base: LANDMARK_INDEX.littleMcp,
    pip: LANDMARK_INDEX.littlePip,
    dip: LANDMARK_INDEX.littleDip,
    tip: LANDMARK_INDEX.littleTip,
  },
} as const

function isFingerExtended(
  landmarks: readonly NormalisedPoint[],
  handScale: number,
  finger: FingerDefinition,
) {
  const pipAngle = calculateJointAngle(landmarks, finger.base, finger.pip, finger.dip)
  const dipAngle = calculateJointAngle(landmarks, finger.pip, finger.dip, finger.tip)
  const palmCentre = calculatePalmCentre(landmarks)
  const tipDistance = normaliseMeasurement(
    landmarkDistanceFromPoint(landmarks, finger.tip, palmCentre),
    handScale,
  )

  return (
    pipAngle >= GESTURE_CONFIG.extendedFingerAngle &&
    dipAngle >= GESTURE_CONFIG.foldedFingerAngle &&
    tipDistance >= GESTURE_CONFIG.extendedTipDistanceRatio
  )
}

function landmarkDistanceFromPoint(
  landmarks: readonly NormalisedPoint[],
  index: number,
  point: NormalisedPoint,
) {
  const landmark = landmarks[index]

  if (!landmark) {
    return 0
  }

  const planarDistance = Math.hypot(landmark.x - point.x, landmark.y - point.y)

  return Math.hypot(planarDistance, landmark.z - point.z)
}

function isThumbExtended(
  landmarks: readonly NormalisedPoint[],
  handScale: number,
) {
  return (
    normaliseMeasurement(
      landmarkDistance(landmarks, LANDMARK_INDEX.thumbTip, LANDMARK_INDEX.indexMcp),
      handScale,
    ) >= GESTURE_CONFIG.thumbExtendedDistanceRatio
  )
}

export function analyseFingers(
  landmarks: readonly NormalisedPoint[],
  handScale: number,
): FingerStates {
  return {
    thumb: isThumbExtended(landmarks, handScale),
    index: isFingerExtended(landmarks, handScale, fingerDefinitions.index),
    middle: isFingerExtended(landmarks, handScale, fingerDefinitions.middle),
    ring: isFingerExtended(landmarks, handScale, fingerDefinitions.ring),
    little: isFingerExtended(landmarks, handScale, fingerDefinitions.little),
  }
}
