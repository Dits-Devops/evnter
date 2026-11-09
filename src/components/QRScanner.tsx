'use client';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (token: string) => void;
  active?: boolean;
}

export default function QRScanner({ onScan, active = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (active) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(scanFrame);
      }
    } catch {
      setError('Tidak dapat mengakses kamera. Izinkan akses kamera dan coba lagi.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }

  function scanFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      stopCamera();
      onScan(code.data);
      return;
    }
    animationRef.current = requestAnimationFrame(scanFrame);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/90 border border-white/10 rounded-3xl text-center space-y-2.5 w-full">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center mx-auto text-xl font-bold">
          📷
        </div>
        <p className="text-neutral-300 font-bold text-xs">{error}</p>
        <p className="text-neutral-500 text-[10px]">Gunakan tab &quot;Input Kode Manual&quot; jika kamera tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden bg-neutral-950 aspect-square border border-white/10 shadow-2xl flex items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {scanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 border-2 border-primary rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.35)] relative overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse shadow-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
