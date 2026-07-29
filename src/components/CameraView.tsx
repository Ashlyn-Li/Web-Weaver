import { useEffect, useRef } from 'react'

type CameraViewProps = {
  stream: MediaStream
}

export function CameraView({ stream }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current

    if (!videoElement) {
      return
    }

    videoElement.srcObject = stream

    return () => {
      videoElement.srcObject = null
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      className="camera-view"
      autoPlay
      playsInline
      muted
      aria-label="Live mirrored camera feed"
    />
  )
}
