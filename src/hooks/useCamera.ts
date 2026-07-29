import { useCallback, useEffect, useRef, useState } from 'react'
import type { CameraDevice, CameraStatus, UseCameraResult } from '../types/camera'

function getCameraConstraints(deviceId: string): MediaStreamConstraints {
  const videoConstraints: MediaTrackConstraints = deviceId
    ? {
        deviceId: { exact: deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      }
    : {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      }

  return {
    video: videoConstraints,
    audio: false,
  }
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
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const refreshDevices = useCallback(async () => {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.enumerateDevices !== 'function'
    ) {
      setDevices([])
      return
    }

    const mediaDevices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = mediaDevices
      .filter((device) => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      }))

    setDevices(videoDevices)

    setSelectedDeviceId((currentDeviceId) => {
      if (
        currentDeviceId &&
        videoDevices.some((device) => device.deviceId === currentDeviceId)
      ) {
        return currentDeviceId
      }

      return videoDevices[0]?.deviceId ?? ''
    })
  }, [])

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

  const startCamera = useCallback(async (deviceId = selectedDeviceId) => {
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
        await navigator.mediaDevices.getUserMedia(getCameraConstraints(deviceId))

      replaceStream(nextStream)
      await refreshDevices()
      setStatus('active')
    } catch (caughtError) {
      replaceStream(null)
      const cameraError = getCameraError(caughtError)
      setStatus(cameraError.status)
      setError(cameraError.message)
    }
  }, [refreshDevices, replaceStream, selectedDeviceId])

  const selectCamera = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId)

      if (status === 'active') {
        await startCamera(deviceId)
      }
    },
    [startCamera, status],
  )

  useEffect(() => {
    void refreshDevices().catch(() => {
      setDevices([])
    })
  }, [refreshDevices])

  useEffect(() => {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.addEventListener !== 'function'
    ) {
      return
    }

    const handleDeviceChange = () => {
      void refreshDevices().catch(() => {
        setDevices([])
      })
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [refreshDevices])

  useEffect(() => {
    return () => {
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [])

  return {
    devices,
    selectedDeviceId,
    stream,
    status,
    error,
    startCamera,
    stopCamera,
    selectCamera,
  }
}
