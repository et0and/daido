"use client";

import { useState, useCallback } from "react";
import WebcamCapture from "./components/WebcamCapture";

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc);
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden">
      <WebcamCapture onCapture={handleCapture} capturedImage={capturedImage} />
    </main>
  );
}
