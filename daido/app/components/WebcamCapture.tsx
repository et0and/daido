'use client'

import { useRef, useCallback, useState } from 'react'

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStream(stream)
    } catch (err) {
      console.error('Error accessing webcam:', err)
    }
  }, [])

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas dimensions
        canvas.width = 300
        canvas.height = 300

        // Calculate crop dimensions
        const size = Math.min(video.videoWidth, video.videoHeight)
        const startX = (video.videoWidth - size) / 2
        const startY = (video.videoHeight - size) / 2

        // Draw cropped and zoomed image
        context.drawImage(
          video,
          startX, startY, size, size,
          0, 0, canvas.width, canvas.height
        )

        // Apply black and white filter to the canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg // red
          data[i + 1] = avg // green
          data[i + 2] = avg // blue
        }
        context.putImageData(imageData, 0, 0)

        // Convert to data URL and call onCapture
        const imageDataUrl = canvas.toDataURL('image/jpeg')
        onCapture(imageDataUrl)
      }
    }
  }, [onCapture])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        {!stream ? (
          <button
            onClick={startWebcam}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Webcam
          </button>
        ) : (
          <button
            onClick={stopWebcam}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Stop Webcam
          </button>
        )}
      </div>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-[640px] h-[480px] bg-gray-200 grayscale"
        />
        {stream && (
          <button
            onClick={captureImage}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Capture Image
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}