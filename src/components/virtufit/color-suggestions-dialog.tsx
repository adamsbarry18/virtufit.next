"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SuggestOutfitColorsOutput } from "@/ai/flows/suggest-outfit-colors";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { useI18n } from "@/context/i18n-context";
import { Badge } from "@/components/ui/badge";

interface ColorSuggestionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: (SuggestOutfitColorsOutput & { item: ImagePlaceholder }) | null;
}

export function ColorSuggestionsDialog({ isOpen, onOpenChange, suggestions }: ColorSuggestionsDialogProps) {
  const { t } = useI18n();

  if (!suggestions) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('colorSuggestionTitle')} {`"${suggestions.item.description}"`}</DialogTitle>
          <DialogDescription>
            {t('explanation')} {suggestions.explanation}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-semibold mb-2">{t('complementaryColors')}</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.complementaryColors.map((color) => (
              <Badge key={color} variant="secondary" className="text-base px-3 py-1 capitalize">
                {color}
              </Badge>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
