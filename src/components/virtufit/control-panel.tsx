'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoUploadPanel } from './photo-upload-panel';
import { CatalogPanel } from './catalog-panel';
import { CartPanel } from './cart-panel';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useI18n } from '@/context/i18n-context';
import { Upload, Shirt, ShoppingCart } from 'lucide-react';

interface ControlPanelProps {
  onPhotoUpload: (file: File) => void;
  catalogItems: (ImagePlaceholder & { isInCart: boolean })[];
  onAddToCart: (item: ImagePlaceholder) => void;
  cartItems: ImagePlaceholder[];
  onRemoveFromCart: (item: ImagePlaceholder) => void;
  onSuggestColors: (item: ImagePlaceholder) => void;
  isSuggestionLoading: boolean;
  itemsOnModel: ImagePlaceholder[];
  onClearOutfit: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function ControlPanel({
  onPhotoUpload,
  catalogItems,
  onAddToCart,
  cartItems,
  onRemoveFromCart,
  onSuggestColors,
  isSuggestionLoading,
  itemsOnModel,
  onClearOutfit,
  activeTab,
  setActiveTab,
  isLoading,
  searchQuery,
  onSearchQueryChange,
}: ControlPanelProps) {
  const { t } = useI18n();
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">
          <Upload className="w-4 h-4 mr-2" />
          {t('upload')}
        </TabsTrigger>
        <TabsTrigger value="catalog">
          <Shirt className="w-4 h-4 mr-2" />
          {t('catalog')}
        </TabsTrigger>
        <TabsTrigger value="cart">
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('cart')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upload" className="mt-4">
        <PhotoUploadPanel onPhotoUpload={onPhotoUpload} />
      </TabsContent>
      <TabsContent value="catalog" className="mt-4">
        <CatalogPanel
          items={catalogItems}
          onSelectItem={onAddToCart}
          onSuggestColors={onSuggestColors}
          isSuggestionLoading={isSuggestionLoading}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      </TabsContent>
      <TabsContent value="cart" className="mt-4">
        <CartPanel
          cartItems={cartItems}
          onRemoveFromCart={onRemoveFromCart}
          itemsOnModel={itemsOnModel}
          onClearOutfit={onClearOutfit}
        />
      </TabsContent>
    </Tabs>
  );
}
