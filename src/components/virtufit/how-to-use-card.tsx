'use client';

import { useState } from 'react';
import { Alert, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Info, X, Camera, Link, ShoppingBag, Palette, Lightbulb } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';

export function HowToUseCard() {
  const [showInfo, setShowInfo] = useState(true);
  const { t } = useI18n();

  const instructions = [
    { icon: Camera, text: t('instruction1') },
    { icon: Link, text: t('instruction2') },
    { icon: ShoppingBag, text: t('instruction3') },
    { icon: Palette, text: t('instruction4') },
  ];

  if (!showInfo) return null;

  return (
    <Alert className="relative bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
      <div className="flex items-start gap-4">
        <Info className="h-6 w-6 mt-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-grow">
          <AlertTitle className="font-bold text-lg mb-2">{t('howToUseTitle')}</AlertTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {instructions.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-100 dark:bg-blue-900/80 p-3 rounded-lg flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <p className="text-sm font-medium">{t('instructionNote')}</p>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-7 w-7 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
        onClick={() => setShowInfo(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </Alert>
  );
}
