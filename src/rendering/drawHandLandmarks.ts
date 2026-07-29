import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { mapNormalizedVideoPoint } from './videoCoordinateTransform'
import { HAND_CONNECTIONS } from '../vision/handConnections'

export interface DrawHandLandmarksOptions {
  context: CanvasRenderingContext2D
  result: HandLandmarkerResult | null
  width: number
  height: number
  mirrored: boolean
  videoWidth: number
  videoHeight: number
}

const connectionStyle = 'rgba(255, 255, 255, 0.78)'
const pointStyle = 'rgba(79, 216, 255, 0.92)'
const pointOutlineStyle = 'rgba(3, 4, 6, 0.58)'

function isValidCoordinate(value: number) {
  return Number.isFinite(value) && value >= -0.5 && value <= 1.5
}

export function drawHandLandmarks({
  context,
  result,
  width,
  height,
  mirrored,
  videoWidth,
  videoHeight,
}: DrawHandLandmarksOptions) {
  context.clearRect(0, 0, width, height)

  if (!result || videoWidth <= 0 || videoHeight <= 0) {
    return
  }

  const lineWidth = Math.max(1.5, width * 0.0018)
  const pointRadius = Math.max(3.5, width * 0.0035)

  context.lineWidth = lineWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = connectionStyle

  result.landmarks.forEach((handLandmarks) => {
    HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
      const start = handLandmarks[startIndex]
      const end = handLandmarks[endIndex]

      if (
        !start ||
        !end ||
        !isValidCoordinate(start.x) ||
        !isValidCoordinate(start.y) ||
        !isValidCoordinate(end.x) ||
        !isValidCoordinate(end.y)
      ) {
        return
      }

      const startPoint = mapNormalizedVideoPoint({
        displayWidth: width,
        displayHeight: height,
        videoWidth,
        videoHeight,
        mirrored,
        x: start.x,
        y: start.y,
      })
      const endPoint = mapNormalizedVideoPoint({
        displayWidth: width,
        displayHeight: height,
        videoWidth,
        videoHeight,
        mirrored,
        x: end.x,
        y: end.y,
      })

      context.beginPath()
      context.moveTo(startPoint.x, startPoint.y)
      context.lineTo(endPoint.x, endPoint.y)
      context.stroke()
    })

    handLandmarks.forEach((landmark) => {
      if (!isValidCoordinate(landmark.x) || !isValidCoordinate(landmark.y)) {
        return
      }

      const point = mapNormalizedVideoPoint({
        displayWidth: width,
        displayHeight: height,
        videoWidth,
        videoHeight,
        mirrored,
        x: landmark.x,
        y: landmark.y,
      })

      context.beginPath()
      context.arc(point.x, point.y, pointRadius + 1.5, 0, Math.PI * 2)
      context.fillStyle = pointOutlineStyle
      context.fill()

      context.beginPath()
      context.arc(point.x, point.y, pointRadius, 0, Math.PI * 2)
      context.fillStyle = pointStyle
      context.fill()
    })
  })
}
