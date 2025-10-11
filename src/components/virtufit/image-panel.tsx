'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import { Card } from '../ui/card';

import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface ImagePanelProps {
  userImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  onClearPhoto: () => void;
  onDropItem?: (item: ImagePlaceholder) => void;
}

export function ImagePanel({
  userImage,
  generatedImage,
  isLoading,
  onClearPhoto,
  onDropItem,
}: ImagePanelProps) {
  const { t } = useI18n();

  const displayImage = generatedImage || userImage;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!onDropItem) return;

    try {
      const itemData = e.dataTransfer.getData('application/json');
      if (itemData) {
        const item: ImagePlaceholder = JSON.parse(itemData);
        onDropItem(item);
      }
    } catch (error) {
      console.error('Error parsing dropped item:', error);
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between flex-grow">
      <div
        className="relative w-full flex-grow flex items-center justify-center rounded-lg bg-muted/20 min-h-[30vh] lg:min-h-[40vh]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
            <p className="font-semibold text-foreground">{t('generating')}</p>
          </div>
        )}

        {userImage && !isLoading && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 z-20 rounded-full h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onClearPhoto();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {displayImage && (
          <Image
            src={displayImage}
            alt="User or generated image"
            fill
            className="object-contain rounded-lg"
          />
        )}
      </div>
    </Card>
  );
}
