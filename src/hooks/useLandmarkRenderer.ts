import { useEffect, type RefObject } from 'react'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { drawHandLandmarks } from '../rendering/drawHandLandmarks'

function syncCanvasSize(canvas: HTMLCanvasElement) {
  const pixelRatio = window.devicePixelRatio || 1
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight
  const nextWidth = Math.max(1, Math.floor(displayWidth * pixelRatio))
  const nextHeight = Math.max(1, Math.floor(displayHeight * pixelRatio))

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth
    canvas.height = nextHeight
  }

  return {
    displayWidth,
    displayHeight,
    pixelRatio,
  }
}

function clearCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
}

export function useLandmarkRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  latestResultRef: RefObject<HandLandmarkerResult | null>,
  enabled: boolean,
  mirrored: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    if (!enabled) {
      clearCanvas(canvas)
      return
    }

    let frameId: number | null = null
    let resizeObserver: ResizeObserver | null = null

    const renderFrame = () => {
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (!context || !video || video.videoWidth <= 0 || video.videoHeight <= 0) {
        clearCanvas(canvas)
        frameId = requestAnimationFrame(renderFrame)
        return
      }

      const { displayWidth, displayHeight, pixelRatio } = syncCanvasSize(canvas)

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      drawHandLandmarks({
        context,
        result: latestResultRef.current,
        width: displayWidth,
        height: displayHeight,
        mirrored,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      })

      frameId = requestAnimationFrame(renderFrame)
    }

    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(() => {
        syncCanvasSize(canvas)
      })
      resizeObserver.observe(canvas)
    }

    frameId = requestAnimationFrame(renderFrame)

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }

      resizeObserver?.disconnect()
      clearCanvas(canvas)
    }
  }, [canvasRef, enabled, latestResultRef, mirrored, videoRef])
}
