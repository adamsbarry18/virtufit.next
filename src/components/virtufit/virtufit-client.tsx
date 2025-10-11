// This file is machine-generated - edit at your own risk.

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ImagePanel } from './image-panel';
import { PhotoUploadPanel } from './photo-upload-panel';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { generateTryOnImage } from '@/ai/flows/generate-try-on-image';
import {
  suggestOutfitColors,
  type SuggestOutfitColorsOutput,
} from '@/ai/flows/suggest-outfit-colors';
import { useToast } from '@/hooks/use-toast';
import { imageUrlToDataUrl, cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n-context';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Loader2, Palette, Plus } from 'lucide-react';
import { ColorPicker } from '../ui/color-picker';
import { CatalogPanel } from './catalog-panel';
import { UrlScraperPanel } from './url-scraper-panel';
import { HowToUseCard } from './how-to-use-card';
import { useAISettings } from '@/hooks/use-ai-settings';
import { ColorSuggestionsDialog } from './color-suggestions-dialog';

interface VirtuFitClientProps {
  catalogItems: ImagePlaceholder[];
}

export function VirtuFitClient({ catalogItems: initialCatalogItems }: VirtuFitClientProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageDataUri, setUserImageDataUri] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [itemsOnModel, setItemsOnModel] = useState<ImagePlaceholder[]>([]);
  const [dynamicCatalogItems, setDynamicCatalogItems] =
    useState<ImagePlaceholder[]>(initialCatalogItems);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isMoreScraping, setIsMoreScraping] = useState(false);

  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [colorSuggestions, setColorSuggestions] = useState<
    (SuggestOutfitColorsOutput & { item: ImagePlaceholder }) | null
  >(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');

  const { toast } = useToast();
  const { t } = useI18n();
  const { settings } = useAISettings();

  // Couleurs prédéfinies pour un accès rapide
  const quickColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
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

  const handleClearPhoto = () => {
    setUserImage(null);
    setUserImageDataUri(null);
    setGeneratedImage(null);
    setItemsOnModel([]);
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

      if (settings.provider !== 'gemini' && !settings.apiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Required',
          description: `Please enter an API key for ${settings.provider} in the settings.`,
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

        if (validUris.length === 0) {
          throw new Error(`Could not convert any clothing item images. Please check your internet connection and try again.`);
        }

        if (validUris.length !== itemsForModel.length) {
          console.warn(`Only ${validUris.length} out of ${itemsForModel.length} clothing item images could be converted.`);
        }

        const result = await generateTryOnImage({
          photoDataUri: userImageDataUri,
          clothingItemDataUris: validUris,
          newColor: newColor,
          provider: settings.provider,
          apiKey: settings.apiKey,
        });

        if (result.generatedImageDataUri && result.generatedImageDataUri !== userImageDataUri) {
          setGeneratedImage(result.generatedImageDataUri);
        } else {
          throw new Error('Generated image URI is empty or the same as the original.');
        }
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : t('errorGeneratingImage');
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: errorMessage,
        });
        setGeneratedImage(null);
        if (!newColor) {
          setItemsOnModel([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userImageDataUri, toast, t, itemsOnModel, settings]
  );

  const handleColorChange = (color: string) => {
    if (itemsOnModel.length > 0) {
      setSelectedColor(color);
      handleGenerateImage(itemsOnModel[0], color);
    } else {
      toast({
        variant: 'destructive',
        title: 'No Item Selected',
        description: 'Please try on an item before changing its color.',
      });
    }
  };

  const handleCustomColorChange = (color: string) => {
    setSelectedColor(color);
    handleColorChange(color);
  };

  const handleSuggestColors = useCallback(
    async (item: ImagePlaceholder) => {
      setIsSuggestionLoading(true);
      try {
        const result = await suggestOutfitColors({
          clothingItem: item.description,
          baseColor: item.imageHint.split(' ')[0] || 'neutral',
        });
        setColorSuggestions({ ...result, item });
        setIsSuggestionDialogOpen(true);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: 'Could not get color suggestions.',
        });
      } finally {
        setIsSuggestionLoading(false);
      }
    },
    [t, toast]
  );

  const handleScrapeUrl = async (url: string) => {
    setIsScraping(true);
    setDynamicCatalogItems([]);
    setSearchQuery('');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Scraping failed with status: ${response.status}`);
      }

      const scrapedItems: any[] = await response.json();

      if (scrapedItems.length > 0) {
        const newItems: ImagePlaceholder[] = scrapedItems.map((item, index) => ({
          id: `scraped-${index}-${Date.now()}`,
          description: item.description || 'Scraped Item',
          imageUrl: item.imageUrl,
          imageHint: item.imageHint || 'scraped item',
          brand: item.seller || new URL(url).hostname.replace('www.', ''),
          price: parseFloat(item.price?.replace(',', '.').replace(/[^0-9.-]+/g, '') || '0'),
          rating: item.rating || Math.random() * (5 - 3.5) + 3.5,
          reviews: Math.floor(Math.random() * 500),
          status: item.badge?.toLowerCase().includes('new')
            ? 'new'
            : item.badge?.toLowerCase().includes('promo')
            ? 'promo'
            : null,
          originalPrice: undefined, // This would require more complex logic
        }));

        setDynamicCatalogItems(newItems);
        toast({
          title: 'Success',
          description: `Found ${newItems.length} items.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'No items found',
          description: 'Could not find any clothing items on the provided URL.',
        });
        setDynamicCatalogItems(initialCatalogItems); // Revert to default
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: (error as Error).message || 'Failed to extract items from the URL.',
      });
      setDynamicCatalogItems(initialCatalogItems); // Revert to default
    } finally {
      setIsScraping(false);
      setIsMoreScraping(false);
    }
  };

  const handleLoadMore = () => {
    // This functionality is more complex with cheerio and is not implemented in this version.
    // We would need pagination logic which is highly site-specific.
    toast({
      title: 'Heads up!',
      description: 'Load more is not supported with this scraping method yet.',
    });
  };

  const handleClearScrapedItems = () => {
    setDynamicCatalogItems(initialCatalogItems);
    setSearchQuery('');
  };

  const filteredCatalogItems = useMemo(() => {
    if (!searchQuery) {
      return dynamicCatalogItems;
    }
    return dynamicCatalogItems.filter(
      (item) =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dynamicCatalogItems, searchQuery]);

  const hasDynamicItems = dynamicCatalogItems !== initialCatalogItems;

  return (
    <div className="flex flex-col gap-6 py-6">
      <HowToUseCard />
      <div className="w-full">
        {!userImage ? (
          <div className="bg-card border rounded-lg p-6 min-h-[30vh] flex flex-col items-center justify-center text-center">
            <PhotoUploadPanel onPhotoUpload={handlePhotoUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImagePanel
              userImage={userImage}
              generatedImage={generatedImage}
              isLoading={isLoading}
              onClearPhoto={handleClearPhoto}
              onDropItem={handleGenerateImage}
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Palette className="w-5 h-5" />
                  <span className="font-semibold">{t('changeColor')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Couleurs rapides */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Couleurs rapides</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {quickColors.map((color) => (
                      <Button
                        key={color}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 shadow-md disabled:opacity-50 focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          selectedColor === color ? "border-primary ring-2 ring-primary" : "border-white"
                        )}
                        onClick={() => handleColorChange(color)}
                        disabled={itemsOnModel.length === 0 || isLoading}
                        aria-label={`Change color to ${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Sélecteur de couleur personnalisé */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Couleur personnalisée</h4>
                  <ColorPicker
                    value={selectedColor}
                    onChange={handleCustomColorChange}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="w-full space-y-6">
        <UrlScraperPanel
          onScrape={(url) => handleScrapeUrl(url)}
          isScraping={isScraping}
          onClear={handleClearScrapedItems}
          hasDynamicItems={hasDynamicItems}
        />
        <CatalogPanel
          items={filteredCatalogItems}
          isLoading={isScraping}
          onSelectItem={(item) => handleGenerateImage(item)}
          onTryOnItem={(item) => handleGenerateImage(item)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSuggestColors={handleSuggestColors}
          isSuggestionLoading={isSuggestionLoading}
        />
        {hasDynamicItems && !isScraping && !isMoreScraping && filteredCatalogItems.length > 0 && (
          <div className="flex justify-center">
            <Button onClick={handleLoadMore} variant="outline">
              {t('loadMore')}
            </Button>
          </div>
        )}
        {isMoreScraping && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <ColorSuggestionsDialog
        isOpen={isSuggestionDialogOpen}
        onOpenChange={setIsSuggestionDialogOpen}
        suggestions={colorSuggestions}
      />
    </div>
  );
}
