'use client'

import { useState, useRef, useCallback } from 'react'
import WebcamCapture from './components/WebcamCapture'

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <WebcamCapture onCapture={handleCapture} />
      {capturedImage && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Captured Image</h2>
          <img src={capturedImage} alt="Captured" className="max-w-full h-auto" />
        </div>
      )}
    </main>
  )
}