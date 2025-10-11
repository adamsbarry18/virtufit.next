// This file is machine-generated - edit at your own risk.

'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useI18n } from '@/context/i18n-context';
import { Loader2, Search, Shirt, ShoppingBag, Star, Palette, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface CatalogPanelProps {
  items: ImagePlaceholder[];
  onSelectItem: (item: ImagePlaceholder) => void;
  onTryOnItem: (item: ImagePlaceholder) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSuggestColors: (item: ImagePlaceholder) => void;
  isSuggestionLoading: boolean;
}

const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
      {halfStar && (
        <Star
          key="half"
          className="w-4 h-4 fill-amber-400 text-amber-400"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
    </div>
  );
};

const CatalogSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    ))}
  </div>
);

export function CatalogPanel({
  items,
  onSelectItem,
  onTryOnItem,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  onSuggestColors,
  isSuggestionLoading,
}: CatalogPanelProps) {
  const { t } = useI18n();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ImagePlaceholder) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <Shirt className="w-6 h-6" />
          {t('catalogTitle')}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="pr-4">
              <CatalogSkeleton />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <ShoppingBag className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
              <p className="font-semibold">{searchQuery ? t('noResults') : t('catalogEmpty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 pr-4">
              {items.map((item) => (
                <div key={item.id} className="space-y-2 group">
                  <div className="overflow-hidden rounded-lg">
                    <div 
                      className="aspect-[3/4] bg-muted relative cursor-pointer"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => onTryOnItem(item)}
                      title={`Glisser-déposer ou cliquer pour essayer ${item.description}`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.description}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        data-ai-hint={item.imageHint}
                        unoptimized
                        priority={items.indexOf(item) < 4} // Priority for first 4 images (above fold)
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSuggestColors(item);
                        }}
                        disabled={isSuggestionLoading}
                      >
                        {isSuggestionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Palette className="w-4 h-4" />
                        )}
                        <span className="sr-only">Suggest Colors</span>
                      </Button>
                    </div>

                    {item.status && (
                      <Badge
                        variant={item.status === 'new' ? 'default' : 'destructive'}
                        className="absolute top-2 left-2 rounded-full"
                      >
                        {item.status === 'new' ? t('new') : t('promo')}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground truncate">{item.brand}</p>
                    <p className="text-muted-foreground leading-tight h-8">{item.description}</p>
                    <StarRating rating={item.rating} reviews={item.reviews} />
                    <div className="flex items-baseline gap-2 pt-1">
                      <p
                        className={cn(
                          'font-semibold text-base',
                          item.status === 'promo' && 'text-destructive'
                        )}
                      >
                        ${item.price.toFixed(2)}
                      </p>
                      {item.status === 'promo' && item.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${item.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
