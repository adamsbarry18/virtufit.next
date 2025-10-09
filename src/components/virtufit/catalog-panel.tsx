/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useI18n } from '@/context/i18n-context';
import { Shirt, Search, Star } from 'lucide-react';

interface CatalogItem extends ImagePlaceholder {
  price?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  seller?: string;
  url?: string;
}

interface CatalogPanelProps {
  items: (CatalogItem & { isInCart: boolean })[];
  onSelectItem: (item: ImagePlaceholder) => void;
}

export function CatalogPanel({ items, onSelectItem }: CatalogPanelProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shirt className="w-6 h-6 text-primary" />
          {t('catalogTitle')}
        </CardTitle>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchItems')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shirt className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('noItemsFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => onSelectItem(item)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-virtufit-item', JSON.stringify(item));
                    e.dataTransfer.setData('text/plain', item.imageUrl);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <div className="rounded-lg overflow-hidden bg-white border shadow-sm">
                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute mt-3 ml-3 z-10">
                        <span className="inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.description}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        style={{ minHeight: 170 }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="p-3">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {item.seller ?? 'Brand'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {item.description}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {typeof item.rating === 'number' ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
                              {typeof item.reviews === 'number' && (
                                <span className="text-xs text-muted-foreground">
                                  ({item.reviews})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              {item.url ? 'Online' : ''}
                            </div>
                          )}
                        </div>

                        <div className="text-sm font-bold text-foreground">{item.price ?? ''}</div>
                      </div>
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
