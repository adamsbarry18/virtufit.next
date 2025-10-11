'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { useI18n } from '@/context/i18n-context';
import { useAISettings } from '@/hooks/use-ai-settings';

type AIProvider = 'openai' | 'gemini' | 'leonardo' | 'seedream';

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { settings, updateSettings } = useAISettings();

  // S'assurer que Gemini est la valeur par défaut si settings.provider n'existe pas
  const provider = settings.provider || 'gemini';

  const handleProviderChange = (provider: string) => {
    updateSettings({ provider: provider as AIProvider });
  };
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ apiKey: e.target.value });
  };
  const handleSave = () => {
    localStorage.setItem('virtufit-ai-settings', JSON.stringify(settings));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background to-muted/20 border-2 border-primary/20">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            {t('settingsTitle')}
          </DialogTitle>
          <DialogDescription className="text-base">{t('settingsDescription')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-2">
          <div className="space-y-3">
            <Label htmlFor="ai-provider" className="text-base font-semibold text-foreground">
              {t('aiProvider')}
            </Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger
                id="ai-provider"
                className="h-12 border-2 border-primary/20 hover:border-primary transition-all"
              >
                <SelectValue placeholder={t('providerSelect')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Gemini (Banana)
                  </div>
                </SelectItem>
                <SelectItem value="openai" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {t('providerOpenAI')}
                  </div>
                </SelectItem>
                <SelectItem value="leonardo" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    {t('providerLeonardo')}
                  </div>
                </SelectItem>
                <SelectItem value="seedream" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    {t('providerSeedream')}
                  </div>
                </SelectItem>
                <SelectItem value="replicate" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    Replicate
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="api-key" className="text-base font-semibold text-foreground">
              {t('apiKey')}
            </Label>
            <Input
              id="api-key"
              placeholder="sk-... ou votre clé API personnelle"
              className="h-12 border-2 border-primary/20 hover:border-primary transition-all"
              value={
                provider === 'replicate' && !settings.apiKey
                  ? 'AIzaSyCd_y8romC0nRDe_YzyEH1kuK05xwFgJXE'
                  : settings.apiKey
              }
              onChange={handleApiKeyChange}
              type="password"
            />
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">{t('settingsNote')}</p>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 py-2 shadow-lg"
            >
              {t('settingsSave')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
