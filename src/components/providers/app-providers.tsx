"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { CurrencyProvider } from "./currency-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ThemeProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </ThemeProvider>
    </NextAuthSessionProvider>
  );
}
