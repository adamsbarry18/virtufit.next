'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, StopCircle, Upload } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';

interface PhotoUploadPanelProps {
  onPhotoUpload: (file: File) => void;
}

export function PhotoUploadPanel({ onPhotoUpload }: PhotoUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const { t } = useI18n();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
    }
  };

  const handleUploadAreaClick = () => {
    inputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setUsingCamera(true);
    } catch (err) {
      console.error('Error accessing camera', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setUsingCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onPhotoUpload(file);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {!usingCamera && (
        <div
          className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-300 bg-gradient-to-br from-muted/30 to-muted/10"
          onClick={handleUploadAreaClick}
        >
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
                <Upload className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('uploadTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('uploadSubtitle')}</p>
            <p className="text-xs text-muted-foreground mt-2">{t('fileFormatHint')}</p>
          </div>
          <Input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
          <div className="mt-8 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              className="flex items-center gap-2 shadow-md"
            >
              <Camera className="w-5 h-5" />
              <span>Use Camera</span>
            </Button>
          </div>
        </div>
      )}

      {usingCamera && (
        <div className="flex-grow flex flex-col items-center justify-center p-6 border-2 rounded-xl gap-6 bg-gradient-to-br from-muted/30 to-background">
          <div className="w-full max-w-md aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          </div>
          <div className="flex gap-3">
            <Button onClick={capturePhoto} size="lg" className="flex items-center gap-2 shadow-lg">
              <Camera className="w-5 h-5" />
              <span>{t('capturePhoto')}</span>
            </Button>
            <Button
              onClick={stopCamera}
              variant="secondary"
              size="lg"
              className="flex items-center gap-2 shadow-md"
            >
              <StopCircle className="w-5 h-5" />
              <span>{t('cancel')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
