import { useEffect, useRef, type RefObject } from 'react'
import {
  HandLandmarker,
  type HandLandmarkerResult,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import { DEBUG } from '../config/debug'

type LandmarkOverlayProps = {
  resultRef: RefObject<HandLandmarkerResult | null>
  videoRef: RefObject<HTMLVideoElement | null>
}

type DisplayPoint = {
  x: number
  y: number
}

function getDisplayPoint(
  landmark: NormalizedLandmark,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): DisplayPoint {
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const videoWidth = video.videoWidth || canvasWidth
  const videoHeight = video.videoHeight || canvasHeight
  const scale = Math.max(canvasWidth / videoWidth, canvasHeight / videoHeight)
  const renderedWidth = videoWidth * scale
  const renderedHeight = videoHeight * scale
  const offsetX = (canvasWidth - renderedWidth) / 2
  const offsetY = (canvasHeight - renderedHeight) / 2

  return {
    x: canvasWidth - (offsetX + landmark.x * renderedWidth),
    y: offsetY + landmark.y * renderedHeight,
  }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const pixelRatio = window.devicePixelRatio || 1
  const width = Math.floor(canvas.clientWidth * pixelRatio)
  const height = Math.floor(canvas.clientHeight * pixelRatio)

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

function drawLandmarks(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  result: HandLandmarkerResult | null,
) {
  context.clearRect(0, 0, canvas.width, canvas.height)

  if (!result) {
    return
  }

  context.lineWidth = Math.max(2, canvas.width * 0.002)
  context.strokeStyle = 'rgba(255, 255, 255, 0.82)'
  context.fillStyle = '#4fd8ff'

  result.landmarks.forEach((handLandmarks) => {
    HandLandmarker.HAND_CONNECTIONS.forEach((connection) => {
      const start = handLandmarks[connection.start]
      const end = handLandmarks[connection.end]

      if (!start || !end) {
        return
      }

      const startPoint = getDisplayPoint(start, video, canvas)
      const endPoint = getDisplayPoint(end, video, canvas)

      context.beginPath()
      context.moveTo(startPoint.x, startPoint.y)
      context.lineTo(endPoint.x, endPoint.y)
      context.stroke()
    })

    handLandmarks.forEach((landmark) => {
      const point = getDisplayPoint(landmark, video, canvas)
      const radius = Math.max(4, canvas.width * 0.004)

      context.beginPath()
      context.arc(point.x, point.y, radius, 0, Math.PI * 2)
      context.fill()
    })
  })
}

export function LandmarkOverlay({ resultRef, videoRef }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!DEBUG.enabled || !DEBUG.landmarks) {
      return
    }

    let frameId: number | null = null

    const drawFrame = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas?.getContext('2d')

      if (canvas && video && context) {
        resizeCanvas(canvas)
        drawLandmarks(context, video, canvas, resultRef.current)
      }

      frameId = requestAnimationFrame(drawFrame)
    }

    frameId = requestAnimationFrame(drawFrame)

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [resultRef, videoRef])

  if (!DEBUG.enabled || !DEBUG.landmarks) {
    return null
  }

  return (
    <canvas
      className="landmark-overlay"
      aria-hidden="true"
      ref={canvasRef}
    />
  )
}
