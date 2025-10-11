import { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from './settings-dialog';
import { useI18n } from '@/context/i18n-context';

export function SettingsMenu() {
  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-sm"
          >
            <Settings className="h-4 w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenDialog(true)}>
            {t('advancedSettings')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
