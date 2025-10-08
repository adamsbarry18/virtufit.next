"use client";

import React from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface ImagePanelProps {
  userImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  onClearOutfit: () => void;
  onDropTryOn?: (item: ImagePlaceholder) => void;
}

export function ImagePanel({ 
  userImage, 
  generatedImage, 
  isLoading, 
  onClearOutfit,
  onDropTryOn
}: ImagePanelProps) {
  const { t } = useI18n();

  const displayImage = generatedImage || userImage;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Allow drop
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!onDropTryOn) return;
    try {
      const payload = e.dataTransfer.getData('application/x-virtufit-item');
      if (payload) {
        const item: ImagePlaceholder = JSON.parse(payload);
        onDropTryOn(item);
      }
    } catch (err) {
      console.error('Failed to parse dropped item', err);
    }
  };

  return (
      <div 
        className="min-h-[500px] h-[60vh] lg:h-full flex flex-col bg-card rounded-lg justify-between border flex-grow"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div 
          className="relative w-full flex-grow min-h-[400px] flex items-center justify-center rounded-lg bg-muted/20"
        >
          {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
                <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
                <p className="font-semibold text-foreground">{t('generating')}</p>
              </div>
          )}
          
          {displayImage && generatedImage && !isLoading && (
            <Button variant="destructive" size="icon" className="absolute top-4 right-4 z-20 rounded-full h-8 w-8" onClick={(e) => { e.stopPropagation(); onClearOutfit();}}>
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
          {!displayImage && (
            <div className="text-sm text-muted-foreground">
              {t('uploadSubtitle')}
            </div>
          )}
          {displayImage && !isLoading && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/70 px-3 py-1 rounded-full">
              {t('dragDropHint')}
            </div>
          )}
        </div>
      </div>
  );
}
