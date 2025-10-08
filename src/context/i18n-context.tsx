"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  const t = useCallback((key: TranslationKey): string => {
    // First try the current language
    const currentLangTranslations = translations[lang];
    if (key in currentLangTranslations) {
      return currentLangTranslations[key];
    }

    // Fall back to English
    const englishTranslations = translations["en"];
    if (key in englishTranslations) {
      return englishTranslations[key];
    }

    // If key doesn't exist in either, return the key itself
    return key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
