// This file is machine-generated - edit at your own risk.

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, Loader2, RefreshCcw } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';

interface UrlScraperPanelProps {
  onScrape: (url: string) => void;
  isScraping: boolean;
  onClear: () => void;
  hasDynamicItems: boolean;
}

export function UrlScraperPanel({
  onScrape,
  isScraping,
  onClear,
  hasDynamicItems,
}: UrlScraperPanelProps) {
  const [url, setUrl] = useState('https://www.zalando.fr/mode-homme/');
  const { t } = useI18n();

  const handleScrape = () => {
    if (url) {
      onScrape(url);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <Link className="w-5 h-5" />
          {t('scrapeUrlTitle')}
        </CardTitle>
        <CardDescription>{t('scrapeUrlDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder={t('scrapeUrlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isScraping}
          />
          {hasDynamicItems ? (
            <Button onClick={onClear} variant="outline" className="flex-shrink-0">
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('clearScraped')}
            </Button>
          ) : (
            <Button onClick={handleScrape} disabled={isScraping || !url}>
              {isScraping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isScraping ? t('scraping') : t('scrapeUrlButton')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
