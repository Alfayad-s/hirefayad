"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { SUPPORTED_CURRENCIES, type Currency } from "@/lib/currency";

const STORAGE_KEY = "serviceFunnel_currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function getStoredCurrency(): Currency {
  if (typeof window === "undefined") return "USD";
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s && SUPPORTED_CURRENCIES.includes(s as Currency)) return s as Currency;
  } catch {
    /* ignore */
  }
  return "USD";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    setCurrencyState(getStoredCurrency());
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  return ctx ?? { currency: "USD" as Currency, setCurrency: () => {} };
}
