'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';

interface PhotoUploadPanelProps {
  onPhotoUpload: (file: File) => void;
}

export function PhotoUploadPanel({ onPhotoUpload }: PhotoUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
        onClick={handleUploadAreaClick}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-muted border">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold">{t('uploadTitle')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('uploadSubtitle')}</p>
        </div>
        <Input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg"
        />
      </div>
    </div>
  );
}
