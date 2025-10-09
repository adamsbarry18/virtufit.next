/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback } from 'react';
import { CatalogPanel } from './catalog-panel';
import { ImagePanel } from './image-panel';
import { useAISettings } from '@/hooks/use-ai-settings';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { generateTryOnImage } from '@/ai/flows/generate-try-on-image';
import { useToast } from '@/hooks/use-toast';
import { imageUrlToDataUrl } from '@/lib/utils';
import { useI18n } from '@/context/i18n-context';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { PhotoUploadPanel } from './photo-upload-panel';
import { Input } from '../ui/input';
import { Paintbrush, Info, X } from 'lucide-react';

interface VirtuFitClientProps {
  catalogItems: ImagePlaceholder[];
}

export function VirtuFitClient({ catalogItems: initialCatalogItems }: VirtuFitClientProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageDataUri, setUserImageDataUri] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [itemsOnModel, setItemsOnModel] = useState<ImagePlaceholder[]>([]);
  const [catalogItems, setCatalogItems] = useState<ImagePlaceholder[]>(initialCatalogItems || []);
  const [catalogUrl, setCatalogUrl] = useState<string>('');
  const [showGuide, setShowGuide] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const { settings } = useAISettings();

  const colors = [
    '#ff5733',
    '#3357ff',
    '#33ff57',
    '#f3ff33',
    '#ff33f3',
    '#33fff3',
    '#000000',
    '#ffffff',
  ];

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setUserImage(URL.createObjectURL(file));
        setUserImageDataUri(result);
        setGeneratedImage(null);
        setItemsOnModel([]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = useCallback(
    async (itemToTryOn: ImagePlaceholder, newColor?: string) => {
      if (!userImageDataUri) {
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: t('uploadPrompt'),
        });
        return;
      }

      const itemsForModel = itemToTryOn ? [itemToTryOn] : itemsOnModel;
      if (itemsForModel.length === 0) {
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: 'Please select an item to try on first.',
        });
        return;
      }

      setIsLoading(true);
      if (!newColor) {
        setGeneratedImage(null);
      }
      if (itemToTryOn) {
        setItemsOnModel([itemToTryOn]);
      }

      try {
        const clothingItemDataUris = await Promise.all(
          itemsForModel.map((item) => imageUrlToDataUrl(item.imageUrl))
        );

        const validUris = clothingItemDataUris.filter((uri): uri is string => !!uri);

        if (validUris.length !== itemsForModel.length) {
          throw new Error(`Could not convert all images.`);
        }

        const result = await generateTryOnImage({
          photoDataUri: userImageDataUri,
          clothingItemDataUris: validUris,
          provider: settings.provider,
          apiKey: settings.apiKey,
          newColor: newColor,
        });

        if (result.generatedImageDataUri) {
          setGeneratedImage(result.generatedImageDataUri);
        } else {
          throw new Error('Generated image URI is empty.');
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: t('errorGeneratingImage'),
        });
        if (!newColor) {
          setItemsOnModel([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userImageDataUri, toast, t, itemsOnModel, settings.provider, settings.apiKey, setGeneratedImage]
  );

  const handleClearOutfit = () => {
    setGeneratedImage(null);
    setItemsOnModel([]);
    setUserImage(null);
    setUserImageDataUri(null);
  };

  const handleColorChange = (color: string) => {
    if (itemsOnModel.length > 0) {
      handleGenerateImage(itemsOnModel[0], color);
    } else {
      toast({
        variant: 'destructive',
        title: 'No Item Selected',
        description: 'Please try on an item before changing its color.',
      });
    }
  };

  // Loader for an external e-commerce page or JSON feed.
  // If a page URL is provided, we POST it to /api/scrape to extract product images.
  // Expected returned shape: Array of { id, imageUrl, description, imageHint }
  const loadCatalog = async () => {
    if (!catalogUrl) return;
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: catalogUrl }),
      });
      if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Catalog response is not an array');
      // Best-effort mapping to ImagePlaceholder shape
      const mapped: ImagePlaceholder[] = data
        .map((p: any, idx: number) => ({
          id: String(p.id ?? idx),
          imageUrl: String(p.imageUrl ?? p.image?.src ?? p.thumbnail ?? ''),
          description: String(p.description ?? p.title ?? 'Item'),
          imageHint: p.imageHint ?? undefined,
        }))
        .filter((p: ImagePlaceholder) => p.imageUrl);
      setCatalogItems(mapped);
      toast({ title: t('catalogLoaded'), description: `${mapped.length} ${t('itemsCount')}` });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t('catalogError'),
        description: (err as Error).message,
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* User Guide Banner */}
      {showGuide && (
        <Card className="mx-4 mt-4 md:mx-6 md:mt-6 mb-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <div className="p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setShowGuide(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-start gap-3 pr-8">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-2 text-blue-900 dark:text-blue-100">
                  {t('guideTitle')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <div className="flex items-start gap-2">
                    <span>📸</span>
                    <span>{t('guideStep1')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🔗</span>
                    <span>{t('guideStep2')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>👔</span>
                    <span>{t('guideStep3')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🎨</span>
                    <span>{t('guideStep4')}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-md inline-block">
                  💡 {t('guideNote')}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sticky Top: Upload + Change Color (full-width) */}
      <div className="sticky top-0 z-30 bg-background/60 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
          <div className="lg:col-span-2">
            <PhotoUploadPanel onPhotoUpload={handlePhotoUpload} />
          </div>
          <div className="lg:col-span-1 flex items-start">
            <Card className="w-full p-4 bg-white border-2 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Paintbrush className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">{t('changeColor')}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {colors.map((color) => (
                  <Button
                    key={color}
                    style={{ backgroundColor: color }}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                    onClick={() => handleColorChange(color)}
                    disabled={itemsOnModel.length === 0 || isLoading}
                    aria-label={`Change color to ${color}`}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Import from Web (fixed, non-scrollable) */}
      <div className="mx-4 md:mx-6 my-4">
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-background border-2 shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">🔗 {t('importFromWeb')}</span>
            </div>
            <span className="text-sm text-muted-foreground">{t('importFromWebSubtitle')}</span>
            <div className="flex gap-2">
              <Input
                placeholder={t('catalogUrlPlaceholder')}
                value={catalogUrl}
                onChange={(e) => setCatalogUrl(e.target.value)}
                className="flex-1 bg-white"
              />
              <Button onClick={loadCatalog} variant="default" className="px-6">
                {t('loadCatalog')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image Panel */}
          <div className="flex flex-col gap-4">
            <ImagePanel
              userImage={userImage}
              generatedImage={generatedImage}
              isLoading={isLoading}
              onClearOutfit={handleClearOutfit}
              onDropTryOn={(item) => handleGenerateImage(item)}
            />
          </div>
          {/* Right: Empty for now */}
          <div className="flex flex-col gap-4">
          </div>
        </div>
      </div>

      {/* Full-width Catalog at bottom */}
      <div className="p-4 md:p-6">
        <div className="max-h-[60vh] overflow-auto">
          <CatalogPanel
            items={catalogItems.map((item) => ({ ...item, isInCart: false }))}
            onSelectItem={(item) => handleGenerateImage(item)}
          />
        </div>
      </div>
    </div>
  );
}
