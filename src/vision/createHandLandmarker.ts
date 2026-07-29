import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerOptions,
} from '@mediapipe/tasks-vision'

const wasmAssetPath = '/wasm/mediapipe'

const handLandmarkerOptions: HandLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: '/models/hand_landmarker.task',
    delegate: 'GPU',
  },
  runningMode: 'VIDEO',
  numHands: 2,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
}

export async function createHandLandmarker() {
  try {
    const visionFileset = await FilesetResolver.forVisionTasks(wasmAssetPath)

    try {
      return await HandLandmarker.createFromOptions(
        visionFileset,
        handLandmarkerOptions,
      )
    } catch (gpuError) {
      console.warn('GPU hand landmarker initialisation failed', gpuError)

      return await HandLandmarker.createFromOptions(visionFileset, {
        ...handLandmarkerOptions,
        baseOptions: {
          ...handLandmarkerOptions.baseOptions,
          delegate: 'CPU',
        },
      })
    }
  } catch (error) {
    console.error('Unable to initialise MediaPipe Hand Landmarker', error)
    throw new Error('Unable to initialise hand tracking')
  }
}
