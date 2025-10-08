'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, X } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import { cn } from '@/lib/utils';

interface CartPanelProps {
  cartItems: ImagePlaceholder[];
  onRemoveFromCart: (item: ImagePlaceholder) => void;
  itemsOnModel: ImagePlaceholder[];
  onClearOutfit: () => void;
}

export function CartPanel({
  cartItems,
  onRemoveFromCart,
  itemsOnModel,
  onClearOutfit,
}: CartPanelProps) {
  const { t } = useI18n();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ImagePlaceholder) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{t('cartTitle')}</CardTitle>
            <CardDescription>{t('cartSubtitle')}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearOutfit}
            disabled={itemsOnModel.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('clearOutfit')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {cartItems.length > 0 ? (
            <div className="space-y-2 pr-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={cn(
                    'flex items-center p-2 rounded-lg border bg-card hover:bg-muted cursor-grab active:cursor-grabbing transition-colors',
                    itemsOnModel.some((modelItem) => modelItem.id === item.id) &&
                      'ring-2 ring-primary'
                  )}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
                    width={48}
                    height={48}
                    className="rounded-md aspect-square object-cover"
                    data-ai-hint={item.imageHint}
                  />
                  <p className="ml-4 flex-grow font-medium text-sm truncate">{item.description}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    onClick={() => onRemoveFromCart(item)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove from cart</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground p-8">
              <p>{t('cartEmpty')}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
