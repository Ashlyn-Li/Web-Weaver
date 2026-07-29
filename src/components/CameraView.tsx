import { forwardRef, useEffect, useRef } from 'react'

type CameraViewProps = {
  stream: MediaStream
}

export const CameraView = forwardRef<HTMLVideoElement, CameraViewProps>(
  function CameraView({ stream }, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const setVideoRef = (videoElement: HTMLVideoElement | null) => {
      videoRef.current = videoElement

      if (typeof ref === 'function') {
        ref(videoElement)
        return
      }

      if (ref) {
        ref.current = videoElement
      }
    }

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
        ref={setVideoRef}
        className="camera-view"
        autoPlay
        playsInline
        muted
        aria-label="Live mirrored camera feed"
      />
    )
  },
)
