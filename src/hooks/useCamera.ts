import { useCallback, useEffect, useRef, useState } from 'react'
import type { CameraStatus, UseCameraResult } from '../types/camera'

const cameraConstraints: MediaStreamConstraints = {
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.stop()
  })
}

function getCameraError(error: unknown): {
  status: CameraStatus
  message: string
} {
  if (!(error instanceof DOMException)) {
    console.error('Unexpected camera error', error)
    return {
      status: 'error',
      message: 'Unable to start the camera',
    }
  }

  switch (error.name) {
    case 'NotAllowedError':
      return {
        status: 'denied',
        message: 'Permission denied',
      }
    case 'NotFoundError':
      return {
        status: 'unavailable',
        message: 'No camera found',
      }
    case 'NotReadableError':
      return {
        status: 'error',
        message: 'Camera already in use by another application',
      }
    case 'OverconstrainedError':
      return {
        status: 'error',
        message: 'Requested camera settings are unsupported',
      }
    case 'SecurityError':
      return {
        status: 'error',
        message: 'Camera access requires a secure browser context',
      }
    default:
      console.error('Unexpected camera error', error)
      return {
        status: 'error',
        message: 'Unable to start the camera',
      }
  }
}

export function useCamera(): UseCameraResult {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const replaceStream = useCallback((nextStream: MediaStream | null) => {
    stopStream(streamRef.current)
    streamRef.current = nextStream
    setStream(nextStream)
  }, [])

  const stopCamera = useCallback(() => {
    replaceStream(null)
    setStatus('idle')
    setError(null)
  }, [replaceStream])

  const startCamera = useCallback(async () => {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      replaceStream(null)
      setStatus('unavailable')
      setError('Camera access is not supported in this browser or context')
      return
    }

    setStatus('requesting')
    setError(null)

    try {
      const nextStream =
        await navigator.mediaDevices.getUserMedia(cameraConstraints)

      replaceStream(nextStream)
      setStatus('active')
    } catch (caughtError) {
      replaceStream(null)
      const cameraError = getCameraError(caughtError)
      setStatus(cameraError.status)
      setError(cameraError.message)
    }
  }, [replaceStream])

  useEffect(() => {
    return () => {
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [])

  return {
    stream,
    status,
    error,
    startCamera,
    stopCamera,
  }
}
