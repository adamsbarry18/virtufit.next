/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useI18n } from '@/context/i18n-context';
import { Shirt, Search } from 'lucide-react';

interface CatalogPanelProps {
  items: (ImagePlaceholder & { isInCart: boolean })[];
  onSelectItem: (item: ImagePlaceholder) => void;
}

export function CatalogPanel({
  items,
  onSelectItem,
}: CatalogPanelProps) {
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
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2 cursor-pointer group"
                  onClick={() => onSelectItem(item)}
                  draggable
                  onDragStart={(e) => {
                    // Custom drag payload for VirtuFit items
                    e.dataTransfer.setData('application/x-virtufit-item', JSON.stringify(item));
                    // Fallback text/uri for broader compatibility
                    e.dataTransfer.setData('text/plain', item.imageUrl);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <Card className="overflow-hidden transition-all group-hover:ring-2 group-hover:ring-primary group-hover:shadow-lg">
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={item.imageUrl}
                        alt={item.description}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        data-ai-hint={item.imageHint}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Card>
                  <p className="text-xs font-medium text-center text-foreground truncate px-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
