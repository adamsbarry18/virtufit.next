"use client";

import { LanguageSwitcher } from "./language-switcher";
import { useI18n } from "@/context/i18n-context";
import { SettingsDialog } from "@/components/virtufit/settings-dialog";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b-2 border-primary/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {t("appName")}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {t("tagline")}
                </p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('aiPowered')}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <LanguageSwitcher />
            <SettingsDialog />
          </div>
        </div>
      </div>
    </header>
  );
}
