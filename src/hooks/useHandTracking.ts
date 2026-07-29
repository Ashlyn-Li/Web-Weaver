import { useEffect, useRef, useState, type RefObject } from 'react'
import type {
  HandLandmarker,
  HandLandmarkerResult,
} from '@mediapipe/tasks-vision'
import { createHandLandmarker } from '../vision/createHandLandmarker'
import type {
  HandTrackingStatus,
  HandTrackingSummary,
} from '../types/handTracking'

const emptySummary: HandTrackingSummary = {
  handCount: 0,
  leftHandDetected: false,
  rightHandDetected: false,
}

const maxConsecutiveInferenceErrors = 5

function getTrackingErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected hand-tracking failure'
}

function getSummaryFromResult(result: HandLandmarkerResult): HandTrackingSummary {
  const handedness = result.handedness ?? result.handednesses ?? []

  return handedness.reduce<HandTrackingSummary>(
    (summary, handClassifications) => {
      const label = handClassifications[0]?.categoryName.toLowerCase()

      // The preview video is mirrored in CSS only; MediaPipe receives the
      // unmirrored video frame, so its handedness labels are used as reported.
      return {
        handCount: summary.handCount + 1,
        leftHandDetected: summary.leftHandDetected || label === 'left',
        rightHandDetected: summary.rightHandDetected || label === 'right',
      }
    },
    {
      handCount: result.landmarks.length,
      leftHandDetected: false,
      rightHandDetected: false,
    },
  )
}

function summariesMatch(
  currentSummary: HandTrackingSummary,
  nextSummary: HandTrackingSummary,
) {
  return (
    currentSummary.handCount === nextSummary.handCount &&
    currentSummary.leftHandDetected === nextSummary.leftHandDetected &&
    currentSummary.rightHandDetected === nextSummary.rightHandDetected
  )
}

type UseHandTrackingResult = {
  status: HandTrackingStatus
  summary: HandTrackingSummary
  error: string | null
  latestResultRef: RefObject<HandLandmarkerResult | null>
}

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  isActive: boolean,
): UseHandTrackingResult {
  const [status, setStatus] = useState<HandTrackingStatus>('idle')
  const [summary, setSummary] = useState<HandTrackingSummary>(emptySummary)
  const [error, setError] = useState<string | null>(null)
  const detectorRef = useRef<HandLandmarker | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const latestResultRef = useRef<HandLandmarkerResult | null>(null)
  const lastVideoTimeRef = useRef(-1)
  const summaryRef = useRef<HandTrackingSummary>(emptySummary)

  useEffect(() => {
    if (!isActive) {
      setStatus('idle')
      setSummary(emptySummary)
      setError(null)
      summaryRef.current = emptySummary
      latestResultRef.current = null
      return
    }

    let isCancelled = false
    let consecutiveInferenceErrors = 0

    const stopLoop = () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
        frameIdRef.current = null
      }
    }

    const runDetectionLoop = () => {
      if (isCancelled) {
        return
      }

      const video = videoRef.current
      const detector = detectorRef.current

      if (
        !video ||
        !detector ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        frameIdRef.current = requestAnimationFrame(runDetectionLoop)
        return
      }

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime

        try {
          const result = detector.detectForVideo(video, performance.now())
          latestResultRef.current = result
          consecutiveInferenceErrors = 0

          const nextSummary = getSummaryFromResult(result)

          if (!summariesMatch(summaryRef.current, nextSummary)) {
            summaryRef.current = nextSummary
            setSummary(nextSummary)
          }

          setStatus(nextSummary.handCount > 0 ? 'tracking' : 'ready')
        } catch (caughtError) {
          consecutiveInferenceErrors += 1
          console.error('Hand-tracking inference failed', caughtError)

          if (consecutiveInferenceErrors >= maxConsecutiveInferenceErrors) {
            setStatus('error')
            setError('Unexpected hand-tracking failure')
            stopLoop()
            return
          }
        }
      }

      frameIdRef.current = requestAnimationFrame(runDetectionLoop)
    }

    const initialiseTracking = async () => {
      setStatus('loading-model')
      setError(null)
      setSummary(emptySummary)
      summaryRef.current = emptySummary
      latestResultRef.current = null
      lastVideoTimeRef.current = -1

      try {
        const detector = await createHandLandmarker()

        if (isCancelled) {
          detector.close()
          return
        }

        detectorRef.current = detector
        setStatus('ready')
        frameIdRef.current = requestAnimationFrame(runDetectionLoop)
      } catch (caughtError) {
        if (isCancelled) {
          return
        }

        setStatus('error')
        setError(getTrackingErrorMessage(caughtError))
      }
    }

    void initialiseTracking()

    return () => {
      isCancelled = true
      stopLoop()
      detectorRef.current?.close()
      detectorRef.current = null
      latestResultRef.current = null
    }
  }, [isActive, videoRef])

  return {
    status,
    summary,
    error,
    latestResultRef,
  }
}
