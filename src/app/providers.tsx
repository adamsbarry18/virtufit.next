"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/context/i18n-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </I18nProvider>
  );
}
