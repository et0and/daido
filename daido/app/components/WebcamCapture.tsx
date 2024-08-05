"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  capturedImage: string | null;
}

export default function WebcamCapture({
  onCapture,
  capturedImage,
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startWebcam = useCallback(async () => {
    if (!stream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setStream(newStream);
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
  }, [stream]);

  useEffect(() => {
    startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startWebcam, stream]);

  const applyBlackAndWhiteFilter = (
    context: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    context.putImageData(imageData, 0, 0);
  };

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set canvas dimensions to match the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Calculate zoom factor (e.g., 4x zoom)
        const zoomFactor = 4;
        const zoomedSize = Math.min(canvas.width, canvas.height) / zoomFactor;

        // Calculate center point for zooming
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw zoomed in portion of the video
        context.drawImage(
          video,
          centerX - zoomedSize / 2,
          centerY - zoomedSize / 2,
          zoomedSize,
          zoomedSize,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Apply black and white filter with increased contrast
        applyBlackAndWhiteFilter(context, canvas.width, canvas.height);

        // Convert to data URL and call onCapture
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        onCapture(imageDataUrl);
      }
    }
  }, [onCapture]);

  const handleRetake = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="relative w-full h-full">
      {!capturedImage ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover filter grayscale contrast-200"
        />
      ) : (
        <img
          src={capturedImage}
          alt="Captured"
          className="w-full h-full object-cover contrast-200"
        />
      )}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        {!capturedImage ? (
          <button
            onClick={captureImage}
            className="bg-blue-500 transition hover:underline text-white font-bold  py-2 px-4 rounded-full"
          >
            Take photo
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="bg-blue-700 hover:bg-blue-900 underline text-white font-bold py-2 px-4 rounded-full transition"
          >
            Retake
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
