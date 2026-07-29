export const WEB_RENDERING = {
  enabled: true,
} as const

export const WEB_CONFIG = {
  shoot: {
    originAnchor: 'wrist',
    targetDistanceRatio: 5,
    targetSmoothingAlpha: 0.2,
    strandThickness: 2,
  },
  weave: {
    maximumAnchorsPerHand: 5,
    minimumCrossHandConnections: 3,
    maximumCrossHandConnections: 10,
    includePalmCentres: true,
    includeSameHandSupportStrands: true,
    anchorLossToleranceFrames: 4,
  },
  geometry: {
    minimumStrandLength: 0.01,
    maximumStrandLength: 2,
    duplicateDistanceThreshold: 0.015,
  },
  rendering: {
    baseThickness: 2,
    baseOpacity: 0.95,
  },
} as const
